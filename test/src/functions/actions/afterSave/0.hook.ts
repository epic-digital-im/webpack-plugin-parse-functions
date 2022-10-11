import { ClassNames } from '@@functions/types';
import { ServiceConfig } from '@@functions/actions';
import P from 'parse';

type PP = typeof P;


function auditAfterSave(className: string): (request: any) => any {
  return (request: any) => null;
}

async function afterSave(request: any, Parse: PP, config?: ServiceConfig): Promise<any> {
  auditAfterSave(ClassNames.ActionItem)(request);
}

export default afterSave;
