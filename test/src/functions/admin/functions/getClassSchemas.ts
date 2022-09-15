
async function getClassSchemas(request: any) {
  return Parse.Schema.all();
}

export default getClassSchemas;

export const config = {
  requireAnyUserRoles: ['admin', 'editor', 'viewer'],
};
