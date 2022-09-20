import { ServiceConfig } from '@@functions/actions';
import P from 'parse';

type PP = typeof P;

export const config = {
  requireUser: true,
  requireAnyUserRoles: ['editor'],
};

export default async function beforeDelete(request: any, Parse: PP, config?: ServiceConfig): Promise<any> {

}
