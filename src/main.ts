import { Compiler, WebpackPluginInstance, Dependency, Chunk } from 'webpack';
import InjectPlugin from 'webpack-inject-plugin';
import glob from 'glob';
import path from 'path';
import fs from 'fs';

// interface ParseFunctionsPluginType {
//   apply
// }

interface ParseFunctionServiceHooks {
  afterSave: string[];
  afterDelete: string[];
  afterCreate: string[];
  afterUpdate: string[];
  beforeSave: string[];
  beforeDelete: string[];
  beforeCreate: string[];
  beforeUpdate: string[];
  hourly: string[];
  daily: string[];
  weekly: string[];
  monthly: string[];
  datetime: string[];
}

enum ParseServiceSchemaFieldType {
  String = 'String',
  ACL = 'ACL',
  Date = 'Date',
  Relation = 'Relation',
  Pointer = 'Pointer',
  Object = 'Object',
  Array = 'Array',
  Boolean = 'Boolean',
}

type ParseFunctionServiceSchemaFieldRelationType = {
  type: ParseServiceSchemaFieldType.Pointer | ParseServiceSchemaFieldType.Relation;
  targetClass: string;
  required?: boolean;
}

type ParseFunctionServiceSchemaFieldType = {
  type: ParseServiceSchemaFieldType;
  targetClass: string;
  required?: boolean;
}

type ParseFunctionServiceSchemaField = ParseFunctionServiceSchemaFieldRelationType | ParseFunctionServiceSchemaFieldType;

interface ParseFunctionServiceSchema {
  className: string;
  fields: {
    [key: string]: ParseFunctionServiceSchemaField;
  };
  [key: string]: any;
}

interface ParseFunctionService {
  name: string;
  className: string;
  schemaPath: string;
  schema: ParseFunctionServiceSchema;
  functions: string[];
  hooks: ParseFunctionServiceHooks,
  triggers: string[];
}

interface ParseServiceMap {
  [key: string]: ParseFunctionService;
}

const PARSE_HOOK_NAMES = [
  'afterSave',
  'afterDelete',
  'afterCreate',
  'afterUpdate',
  'beforeSave',
  'beforeDelete',
  'beforeCreate',
  'beforeUpdate',
  'hourly',
  'daily',
  'weekly',
  'monthly',
  'datetime',
];

const PARSE_PLUGIN_NAME = 'PARSE FUNCTIONS PLUGIN';

interface ParseFunctionPluginOptions {
  entry?: string;
}

export class ParseFunctionsPlugin implements WebpackPluginInstance {
  options: ParseFunctionPluginOptions;

  constructor(opts?: Partial<ParseFunctionPluginOptions>) {
    this.options = opts || {};
  }

  async apply(compiler: Compiler) {
    const entry = (compiler.options.entry as any).main.import[0];
    const basePath = path.resolve(`${compiler.context}/src/functions`);
    const schemaPaths = glob.sync(`${basePath}/**/schema.json`);
    const buildPath = path.resolve(basePath, '.build');
    const indexFilePath = path.resolve(buildPath, `index.ts`);

    new InjectPlugin(() => `import initializeFunctions from '${indexFilePath}';\n\ninitializeFunctions(Parse);`).apply(compiler);

    if (typeof entry !== 'string' && this.options.entry == null) {
      throw new Error(`[${PARSE_PLUGIN_NAME}]: Because your Webpack config file (webpack.config.js) includes a non-string entry, you'll need to provide an 'entry' option to ensure functions are only inserted in one file`);
    }

    compiler.hooks.compilation.tap(this.constructor.name, async (compilation, params) => {
      // clean build folder
      try {
        fs.rmSync(buildPath, { recursive: true });
      } catch (err) {
        console.warn('[PARSE FUNCTIONS PLUGIN]', 'No build folder found; creating one now');
      }

      fs.mkdirSync(buildPath);

      const services = schemaPaths.reduce((memo, schemaPath) => {
        const p = schemaPath.split(path.sep);
        const serviceDirName = p[p.length - 2];
        const servicePath = path.join(basePath, serviceDirName);
        const schema: ParseFunctionServiceSchema = JSON.parse(fs.readFileSync(schemaPath, { encoding: 'utf-8' }));
        const triggers = glob.sync(`${servicePath}/triggers/**/*`);
        const functions = glob.sync(`${servicePath}/functions/**/*`);
        const hooks = PARSE_HOOK_NAMES.reduce((hMemo, hook) => {
          hMemo[hook as keyof ParseFunctionServiceHooks] = glob.sync(`${servicePath}/${hook}/*`)
          return hMemo;
        }, {} as ParseFunctionServiceHooks);
        
        memo[serviceDirName] = {
          name: serviceDirName,
          className: schema.className,
          schema,
          schemaPath,
          functions,
          triggers,
          hooks,
        };
        return memo;
      }, {} as ParseServiceMap);
      
      Object.entries(services).forEach(([serviceName, service]) => {
        fs.writeFileSync(path.resolve(buildPath, `${serviceName}.ts`), this.makeServiceFile(service));
      });

      fs.writeFileSync(indexFilePath, this.makeServiceIndexFile(services));

      compilation.fileDependencies.add(indexFilePath);
    });
  }

  private makeServiceIndexFile(services: ParseServiceMap) {
    const serviceImports = Object.keys(services)
      .map((serviceName) => `import ${serviceName} from './${serviceName}';`)
      .join('\n');
    const serviceInits = Object.keys(services)
      .map((serviceName) => `  ${serviceName}(Parse);`)
      .join('\n');
    return `
import type P from 'parse';
${serviceImports}

type ParseType = typeof P;

const initialize = (Parse: ParseType) => {
${serviceInits}
}

export default initialize;
`
  }

  private makeServiceFile(service: ParseFunctionService): string {
    const triggerImports = service.triggers.map(createImportFromFilename).join('\n');
    const functionImports = service.functions.map(createImportFromFilename).join('\n');
    const hookImports = Object.entries(service.hooks)
      .reduce((memo, [hookName, hookPaths]: [string, string[]]) => {
        return memo + hookPaths.map(createImportFromFilename).join('\n');
      }, '');

    const hookFunctions = Object.entries(service.hooks)
      .reduce((memo, [hookName, hookPaths]: [string, string[]]) => {
        if (hookPaths.length === 0) return memo;
        return memo + `
  Parse.Cloud.${hookName}<${service.className}>('${service.className}', async (request) => {
    ${hookPaths.map((hookPath) => {
      const funcName = getSanitizedFunctionName(hookPath);
      return `await ${funcName}(request);`
    }).join('\n  ')}
  });
  `;
      }, '');
    
    const functions = service.functions.map((functionPath) => {
      const functionName = getSanitizedFunctionName(functionPath);
      return `  Parse.Cloud.define('${functionName}', ${functionName});`;
    })
    .join('\n');
    
    return `// auto-generated file for ${service.name}
import P from 'parse';
${hookImports}
${triggerImports}
${functionImports}

type ParseType = typeof P;

${this.makeServiceTypeDefinition(service)}

const service = (Parse: ParseType) => {
${hookFunctions}
${functions}
};

export default service;
`
  }

  private makeServiceTypeDefinition(service: ParseFunctionService): string {
    const fields = Object.entries(service.schema.fields).map(([fieldName, opts]) => {
      return `  ${fieldName}${opts.required ? '' : '?'}: ${mapSchemaTypeToTSType(opts)}`
    }).join('\n');
    return `
export interface ${service.schema.className}Attributes {
${fields}
}

export type ${service.schema.className} = P.Object<${service.schema.className}Attributes>;
`
  }

  // private makeHookDefinition()
}


function createImportFromFilename(filePath: string) {
  return `import ${getSanitizedFunctionName(filePath)} from '${filePath.replace(/\.ts$/, '')}';`
}

function getFilename(filePath: string): string {
  const ext = path.extname(filePath);
  return path.basename(filePath, ext);
}

function getSanitizedFunctionName(filePath: string): string {
  const ext = path.extname(filePath);
  const fileName = path.basename(filePath, ext);
  return fileName
    .replace(/^(\d_)|\d\./g, '')
    .replace(/[^a-zA-Z]/g, '_');
}

function mapSchemaTypeToTSType(schemaField: ParseFunctionServiceSchemaField): string {
  switch(schemaField.type) {
    case ParseServiceSchemaFieldType.Relation:
      return `Parse.Relation<${schemaField.targetClass}>`
    case ParseServiceSchemaFieldType.Pointer:
      return `Parse.Pointer<${schemaField.targetClass}>`
    case ParseServiceSchemaFieldType.String:
    case ParseServiceSchemaFieldType.ACL:
      return 'string';
    case ParseServiceSchemaFieldType.Boolean:
      return 'boolean';
    case ParseServiceSchemaFieldType.Date:
      return 'Date';
    case ParseServiceSchemaFieldType.Object:
      return '{ [key: string]: any }';
    case ParseServiceSchemaFieldType.Array:
      return 'any[]';
    default: return 'string';
  }
}

export default ParseFunctionsPlugin;
