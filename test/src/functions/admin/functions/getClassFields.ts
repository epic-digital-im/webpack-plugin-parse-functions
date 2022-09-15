
async function getClassFields(request: any) {
  const { className, group } = request.params;
  const schemas = await Parse.Schema.all();
  const schema = schemas.find((schema: any) => schema.className === className);
  const classLevelPermissions = { ...schema!.classLevelPermissions };
  const protectedFields = classLevelPermissions.protectedFields![group] || [];
  const fields = Object.keys(schema!.fields).filter((field) => {
    return protectedFields.indexOf(field) === -1;
  });

  return {
    schema,
    fields,
    protectedFields,
  };
}

export default getClassFields;
