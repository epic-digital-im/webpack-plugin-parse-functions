import { Compiler, WebpackPluginInstance, NormalModuleReplacementPlugin, Compilation } from 'webpack';
import prettier from 'prettier';
import * as eta from 'eta';
import glob from 'glob';
import path from 'path';
import fs from 'fs';


eta.configure({
  views: path.resolve(__dirname, '../templates'),
});


/* === TYPES === */
enum NativeHookNames {
  beforeSave = 'beforeSave',
  afterSave = 'afterSave',
  beforeDelete = 'beforeDelete',
  afterDelete = 'afterDelete',
}

enum AdditionalBeforeSaveHookNames {
  beforeCreate = 'beforeCreate',
  beforeUpdate = 'beforeUpdate',
}

enum AdditionalAfterSaveHookNames {
  afterCreate = 'afterCreate',
  afterUpdate = 'afterUpdate',
}

enum CronHookNames {
  hourly = 'hourly',
  daily = 'daily',
  weekly = 'weekly',
  monthly = 'monthly',
  datetime = 'datetime',
}

const SubhooksMap = {
  [NativeHookNames.beforeSave]: [
    AdditionalBeforeSaveHookNames.beforeCreate,
    AdditionalBeforeSaveHookNames.beforeUpdate,
  ],
  [NativeHookNames.afterSave]: [
    AdditionalAfterSaveHookNames.afterCreate,
    AdditionalAfterSaveHookNames.afterUpdate,
  ],
  [NativeHookNames.beforeDelete]: [],
  [NativeHookNames.afterDelete]: [],
};

interface ServiceHook {
  hooks: string[];
  config?: string;
}

const AdditionalHookNames = {
  ...AdditionalAfterSaveHookNames,
  ...AdditionalBeforeSaveHookNames,
};

const HookNames = {
  ...NativeHookNames,
  ...AdditionalHookNames,
  ...CronHookNames,
};

type Hooks = {
  [prop in keyof typeof HookNames]: ServiceHook;
}

type CronHooks = {
  [prop in CronHookNames]: ServiceHook;
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
  hooks: Hooks,
  // cronHooks: CronHooks,
  triggers: string[];
  jobs: string[];
  config?: string;
}

interface ParseServiceMap {
  [key: string]: ParseFunctionService;
}

interface ParseFunctionPluginOptions {
  functionDirectory: string;
  moduleAlias: string;
}


/* === PLUGIN === */
const DEFAULT_OPTIONS: ParseFunctionPluginOptions = {
  functionDirectory: 'src/functions',
  moduleAlias: '@@functions',
}

export class ParseFunctionsPlugin implements WebpackPluginInstance {
  options: ParseFunctionPluginOptions;
  basePath?: string;
  buildPath?: string;
  schemaPaths?: string[];
  indexFilePath?: string;

  get templateHelpers() {
    return {
      SubhooksMap,
      CronHookNames,
      AdditionalHookNames,
      mapSchemaTypeToTSType,
      createImportFromFilename,
      getSanitizedFunctionName,
    };
  }

  constructor(opts?: Partial<ParseFunctionPluginOptions>) {
    this.options = Object.assign({}, DEFAULT_OPTIONS, opts);
  }

  async apply(compiler: Compiler) {
    this.basePath = path.resolve(`${compiler.context}`, this.options.functionDirectory);
    this.schemaPaths = glob.sync(`${this.basePath}/**/schema.json`);
    this.buildPath = path.resolve(this.basePath, '.build');
    this.indexFilePath = path.resolve(this.buildPath, `index.ts`);
    
    compiler.hooks.compilation.tap(this.constructor.name, this.startBuild);

    // Look for import of modules that begins with `@@function` and replace with build folder
    new NormalModuleReplacementPlugin(/^@@functions(.*)/, (resource: any) => {
      resource.request = resource.request.replace(this.options.moduleAlias, this.buildPath);
    }).apply(compiler);
  }

  private startBuild = async (compilation: Compilation) => {
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
      const configPath = path.join(servicePath, 'config.ts');
      const schema: ParseFunctionServiceSchema = JSON.parse(fs.readFileSync(schemaPath, { encoding: 'utf-8' }));
      const config = fs.existsSync(configPath) ? configPath : undefined;
      const triggers = glob.sync(`${servicePath}/triggers/*`);
      const functions = glob.sync(`${servicePath}/functions/**/*`);
      const jobs = glob.sync(`${servicePath}/jobs/**/*`);
      const hooks: Hooks = Object.values(HookNames).reduce((hMemo, hookName) => {
        const hookPaths = glob.sync(`${servicePath}/${hookName}/*`);
        const hookConfig = hookPaths.find((path) => /\/config\.t|js$/.test(path));
        if (hookConfig) {
          hookPaths.splice(hookPaths.indexOf(hookConfig), 1);
        }
        hMemo[hookName as keyof typeof HookNames] = {
          hooks: hookPaths,
          config: hookConfig,
        };
        return hMemo;
      }, {} as Hooks);
      
      memo[serviceDirName] = {
        name: serviceDirName,
        className: schema.className,
        schema,
        schemaPath,
        functions,
        triggers,
        hooks,
        jobs,
        config,
      };
      return memo;
    }, {} as ParseServiceMap);
    
    Object.entries(services).forEach(async ([serviceName, service]) => {
      const servicePath = path.resolve(this.buildPath!, `${serviceName}.ts`);
      compilation.fileDependencies.add(this.indexFilePath!);
      fs.writeFileSync(servicePath, await this.makeServiceFile(service));
    });

    const helpersFile = await this.makeHelpersFile(services);
    const indexFile = await this.makeServiceIndexFile(services);

    fs.writeFileSync(path.resolve(`${this.buildPath}`, 'helpers.ts'), helpersFile);
    fs.writeFileSync(this.indexFilePath!, indexFile);

    compilation.fileDependencies.add(this.indexFilePath!);
  }

  private async makeHelpersFile(services: ParseServiceMap): Promise<string> {
    const helpersFileString = await eta.renderFile(
      'helpers.eta',
      { services, helpers: this.templateHelpers }
    ) as string;
    const f = prettier.format(helpersFileString, { parser: 'typescript', printWidth: 112 });
    return f;
  }

  private async makeServiceIndexFile(services: ParseServiceMap): Promise<string> {
    const indexFileString = await eta.renderFile(
      'index.eta',
      { services, helpers: this.templateHelpers }
    ) as string;
    const f = prettier.format(indexFileString, { parser: 'typescript', printWidth: 112 });
    return f;
  }

  private async makeServiceFile(service: ParseFunctionService): Promise<string> {
    const serviceFileString = await eta.renderFile(
      'service.eta',
      { service, helpers: this.templateHelpers }
    ) as string;
    const f = prettier.format(serviceFileString, { parser: 'typescript', printWidth: 112 });
    return f;
  }
}


/* === TEMPLATE HELPERS === */
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
