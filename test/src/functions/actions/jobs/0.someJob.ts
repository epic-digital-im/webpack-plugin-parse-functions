import { ActionItem, ServiceConfig } from '@@functions/actions';
import P from 'parse';

type PP = typeof P;

async function someJob(request: any, Parse: PP, config?: ServiceConfig): Promise<void> {

}

export default someJob;

export const config = {
  requireMaster: true,
};
