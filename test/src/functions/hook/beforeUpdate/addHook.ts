
import { ServiceConfig, Hook } from '@@functions/hook';
import { BeforeCreateHandler } from '@@functions/types';

const HOOK_NAME = 'beforeUpdate';

const beforeCreateHook: BeforeCreateHandler<Hook, ServiceConfig> = async (request, Parse, config) => {
  const { object } = request;
  const hookSet = new Set(object.get('hooksRun'));
  if (hookSet.has(HOOK_NAME)) return;
  hookSet.add(HOOK_NAME);
  object.set('hooksRun', Array.from(hookSet));
  console.log('before update', object.toJSON());
  await object.save();
};

export default beforeCreateHook;
