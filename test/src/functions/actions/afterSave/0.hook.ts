import { ClassNames } from '@@functions';


function auditAfterSave(className: string): (request: any) => any {
  return (request: any) => null;
}

async function afterSave(request: any): Promise<any> {
  auditAfterSave(ClassNames.ActionItem)(request);
}

export default afterSave;
