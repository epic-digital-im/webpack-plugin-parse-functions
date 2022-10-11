import { ServiceConfig, ActionItem } from '@@functions/actions';
import { BeforeCreateHandler } from '@@functions/types';

const beforeCreateHook: BeforeCreateHandler<ActionItem, ServiceConfig> = async (request, Parse, config) => {

};

export default beforeCreateHook;
