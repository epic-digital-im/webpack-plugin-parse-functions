import { ServiceConfig } from '@@functions/actions';
import P from 'parse';

type PP = typeof P;

const beforeCreateHook = (request: any, Parse: PP, config?: ServiceConfig) => {

};

export default beforeCreateHook;