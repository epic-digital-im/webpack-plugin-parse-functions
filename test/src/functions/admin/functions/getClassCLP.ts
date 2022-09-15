
async function getClassCLP(request: any) {
  return (new Parse.Schema(request.params.className) as any).getCLP();
}

export default getClassCLP;

export const config = {
  requireAnyUserRoles: ['admin', 'editor', 'viewer'],
};
