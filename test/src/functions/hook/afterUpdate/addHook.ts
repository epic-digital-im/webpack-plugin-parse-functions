
import { ServiceConfig, Hook } from '@@functions/hook';
import { BeforeCreateHandler } from '@@functions/types';

const HOOK_NAME = 'afterUpdate';

const beforeCreateHook: BeforeCreateHandler<Hook, ServiceConfig> = async (request, Parse, config) => {
  const { object } = request;
  const hookSet = new Set(object.get('hooksRun'));
  if (hookSet.has(HOOK_NAME)) return;
  hookSet.add(HOOK_NAME);
  object.set('hooksRun', Array.from(hookSet));
  await object.save(null, { silent: true, useMasterKey: true });
};

export default beforeCreateHook;
