
async function setProtectedField(request: any) {
  const { className, group, fieldName, value } = request.params;
  const schemas = await Parse.Schema.all();
  const schema = schemas.find((schema: any) => schema.className === className);
  if (schema == null) return;
  const classLevelPermissions = { ...schema.classLevelPermissions };
  
  if (classLevelPermissions.protectedFields?.[group] == null) return;
  const protectedFields = classLevelPermissions.protectedFields?.[group] || [];

  if (value === true) {
    classLevelPermissions.protectedFields[group] = protectedFields.filter(
      (f: string) => f !== fieldName,
    );
  } else {
    if (protectedFields.indexOf(fieldName) === -1) {
      classLevelPermissions.protectedFields[group] = [
        ...protectedFields,
        fieldName,
      ];
    }
  }
  if (classLevelPermissions.protectedFields[group] !== protectedFields) {
    const schemaUpdate = new Parse.Schema(className);
    schemaUpdate.setCLP(classLevelPermissions);
    await schemaUpdate.update();
  }
};

export default setProtectedField;


export const config = {
  requireAnyUserRoles: ['admin'],
};
