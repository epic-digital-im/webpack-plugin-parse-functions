import { ClassNames } from '@@functions/types';
import { ServiceConfig } from '@@functions/actions';
import P from 'parse';

type PP = typeof P;


async function otherHook(request: any, Parse: PP, config?: ServiceConfig): Promise<any> {
  console.log(request);
}

export default otherHook;
