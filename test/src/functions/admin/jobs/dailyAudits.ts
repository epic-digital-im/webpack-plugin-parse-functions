
async function dailyAudits(request: any) {
  Parse.Cloud.startJob('taskAudit', null);
  Parse.Cloud.startJob('propertyAudit', null);
}

export default dailyAudits;
