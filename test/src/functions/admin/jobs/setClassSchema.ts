import { ClassNamesList } from "@@functions";


interface RestSchemaMap {
  [key: string]: Parse.RestSchema;
}

const SchemaConfigs: RestSchemaMap = ClassNamesList.reduce((acc, val) => {
  try {
    acc[val] = require(`@app/shared/schema/${val}.schema.json`);
  } catch (e) {
    console.log(e.message);
  }
  return acc;
}, {} as RestSchemaMap);

const defaults = ["objectId", "createdAt", "updatedAt", "ACL"];

export const initClassSchema = async () => {
  for (let i = 0; i < ClassNamesList.length; i++) {
    const name = ClassNamesList[i];
    try {
      if (name !== "User") {
        console.log(name);
        const schemaConfig = SchemaConfigs[name];
        const parseSchema = new Parse.Schema(name);
        Object.keys(schemaConfig.fields).map((fieldName: string) => {
          const { type, ...options } = schemaConfig.fields[fieldName];
          if (defaults.indexOf(fieldName) === -1) {
            const t = type as Parse.Schema.TYPE;
            parseSchema.addField(fieldName, t, options);
          }
        });
        parseSchema.setCLP(schemaConfig.classLevelPermissions);
        try {
          await parseSchema.save();
        } catch (err) {
          await parseSchema.update();
        }
      }
    } catch (err) {
      console.log(err);
    }
  }
};

async function setClassSchema(request: any) {
  await initClassSchema();
}

export default setClassSchema;


export const config = { requireMaster: true };
