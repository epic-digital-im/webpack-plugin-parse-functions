
async function findDuplicates(request: any) {
  const { objectClass, fieldName } = request.params;
  const query = new Parse.Query(objectClass);
  const results = await query.findAll({ useMasterKey: true });

  return Object.values(
    results.reduce((acc, val) => {
      const data = val.toJSON();
      const value = data[fieldName];
      if (acc[value]) {
        acc[value].push(data as any);
      } else {
        acc[value] = [data as any];
      }
      return acc;
    }, {} as { [key: string]: string[] }),
  ).filter((val: any[]) => val.length > 1);
}

export default findDuplicates;


export const config = { requireMaster: true };