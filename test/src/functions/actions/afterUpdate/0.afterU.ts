import { AfterUpdateHandler } from '@@functions/types';
import { ServiceConfig, ActionItem } from '@@functions/actions';
import P from 'parse';

type PP = typeof P;

const afterU: AfterUpdateHandler<ActionItem, ServiceConfig> = async (request, Parse, config) => {
  
};

export default afterU;
