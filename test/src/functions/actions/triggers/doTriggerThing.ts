import { TriggerHandler, TriggerPayloadSchema, ActionTrigger } from '@@functions/helpers';
import { ServiceConfig, ActionItem } from '@@functions/actions';
import P from 'parse';

type PP = typeof P;

export const payloadSchema: TriggerPayloadSchema = {
  something: {
    type: 'String',
    defaultValue: 'something',
    required: true,
  }
};

const doTriggerThing: TriggerHandler<ServiceConfig> = async (request, Parse, config) => {
  const { trigger, object } = request.params;
  console.log('do trigger thing', trigger, object);
};

export default doTriggerThing;
