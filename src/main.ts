import { Compiler, WebpackPluginInstance, NormalModuleReplacementPlugin, Compilation } from 'webpack';
import prettier from 'prettier';
import * as eta from 'eta';
import glob from 'glob';
import path from 'path';
import fs from 'fs';


const serviceTemplatePath = require.resolve(path.resolve(__dirname, '../templates/service.eta'));
const serviceTemplateString = fs.readFileSync(serviceTemplatePath, { encoding: 'utf-8' });
const indexTemplatePath = require.resolve(path.resolve(__dirname, '../templates/index.eta'));
const indexTemplateString = fs.readFileSync(indexTemplatePath, { encoding: 'utf-8' });
const helpersTemplatePath = require.resolve(path.resolve(__dirname, '../templates/helpers.eta'));
const helpersTemplateString = fs.readFileSync(helpersTemplatePath, { encoding: 'utf-8' });

interface ParseFunctionServiceHook {
  hooks: string[];
  config?: string;
}

enum ServiceHooks {
  afterSave = 'afterSave',
  afterDelete = 'afterDelete',
  afterCreate = 'afterCreate',
  afterUpdate = 'afterUpdate',
  beforeSave = 'beforeSave',
  beforeDelete = 'beforeDelete',
  beforeCreate = 'beforeCreate',
  beforeUpdate = 'beforeUpdate',
  hourly = 'hourly',
  daily = 'daily',
  weekly = 'weekly',
  monthly = 'monthly',
  datetime = 'datetime',
}

type ParseFunctionServiceHooks = {
  [prop in ServiceHooks]: ParseFunctionServiceHook;
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

interface ParseFunctionPluginOptions {
  entry?: string;
}

export class ParseFunctionsPlugin implements WebpackPluginInstance {
  options: ParseFunctionPluginOptions;
  basePath?: string;
  buildPath?: string;
  schemaPaths?: string[];
  indexFilePath?: string;

  get templateHelpers() {
    return {
      mapSchemaTypeToTSType,
      createImportFromFilename,
      getSanitizedFunctionName,
    };
  }

  constructor(opts?: Partial<ParseFunctionPluginOptions>) {
    this.options = opts || {};
  }

  async apply(compiler: Compiler) {
    this.basePath = path.resolve(`${compiler.context}/src/functions`);
    this.schemaPaths = glob.sync(`${this.basePath}/**/schema.json`);
    this.buildPath = path.resolve(this.basePath, '.build');
    this.indexFilePath = path.resolve(this.buildPath, `index.ts`);
    
    compiler.hooks.compilation.tap(this.constructor.name, this.startBuild);

    // Look for import of modules that begins with `@@function` and replace with build folder
    new NormalModuleReplacementPlugin(/^@@functions(.*)/, (resource: any) => {
      resource.request = resource.request.replace('@@functions', this.buildPath);
    }).apply(compiler);
  }

  private startBuild = (compilation: Compilation) => {
    // clean build folder
    try {
      fs.rmSync(this.buildPath!, { recursive: true });
    } catch (err) {
      console.warn('[PARSE FUNCTIONS PLUGIN]', 'No build folder found; creating one now');
    }

    fs.mkdirSync(this.buildPath!);

    const services = this.schemaPaths!.reduce((memo, schemaPath) => {
      const p = schemaPath.split(path.sep);
      const serviceDirName = p[p.length - 2];
      const servicePath = path.join(this.basePath!, serviceDirName);
      const schema: ParseFunctionServiceSchema = JSON.parse(fs.readFileSync(schemaPath, { encoding: 'utf-8' }));
      const triggers = glob.sync(`${servicePath}/triggers/*`);
      const functions = glob.sync(`${servicePath}/functions/**/*`);
      const hooks = Object.values(ServiceHooks).reduce((hMemo, hook) => {
        const hookPaths = glob.sync(`${servicePath}/${hook}/*`);
        const hookConfig = hookPaths.find((path) => /\/config\.t|js$/.test(path));
        if (hookConfig) {
          hookPaths.splice(hookPaths.indexOf(hookConfig), 1);
        }
        hMemo[hook] = {
          hooks: hookPaths,
          config: hookConfig,
        };
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
      const servicePath = path.resolve(this.buildPath!, `${serviceName}.ts`);
      compilation.fileDependencies.add(this.indexFilePath!);
      fs.writeFileSync(servicePath, this.makeServiceFile(service));
    });

    fs.writeFileSync(path.resolve(`${this.buildPath}`, 'helpers.ts'), this.makeHelpersFile(services));
    fs.writeFileSync(this.indexFilePath!, this.makeServiceIndexFile(services));

    compilation.fileDependencies.add(this.indexFilePath!);
  }

  private makeHelpersFile(services: ParseServiceMap) {
    const helpersFileString = eta.render(helpersTemplateString, { services, helpers: this.templateHelpers }) as string;
    const f = prettier.format(helpersFileString, { parser: 'typescript', printWidth: 112 });
    return f;
  }

  private makeServiceIndexFile(services: ParseServiceMap) {
    const indexFileString = eta.render(indexTemplateString, { services, helpers: this.templateHelpers }) as string;
    const f = prettier.format(indexFileString, { parser: 'typescript', printWidth: 112 });
    return f;
  }

  private makeServiceFile(service: ParseFunctionService): string {
    const serviceFileString = eta.render(serviceTemplateString, { service, helpers: this.templateHelpers }) as string;
    const f = prettier.format(serviceFileString, { parser: 'typescript', printWidth: 112 });
    return f;
  }
}


function createImportFromFilename(filePath: string, prefix: string = '') {
  return `import ${getSanitizedFunctionName(filePath, prefix)} from '${filePath.replace(/\.ts$/, '')}';`
}

function getSanitizedFunctionName(filePath: string, prefix: string = ''): string {
  const ext = path.extname(filePath);
  let fileName = path.basename(filePath, ext)
    .replace(/^(\d_)|\d\./g, '')
    .replace(/[^a-zA-Z]/g, '_');
  return prefix ? `${prefix}${fileName}` : fileName;
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
