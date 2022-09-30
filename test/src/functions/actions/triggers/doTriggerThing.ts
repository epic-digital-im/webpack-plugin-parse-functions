import { TriggerHandler, TriggerPayloadSchema, ActionTrigger } from '@@functions/helpers';
import { ServiceConfig, ActionItem } from '@@functions/actions';
import P from 'parse';

type PP = typeof P;

export const payloadSchema: TriggerPayloadSchema = {
  something: {
    type: 'String',
    label: 'Something',
    defaultValue: 'something',
    required: true,
  }
};

const doTriggerThing: TriggerHandler<ServiceConfig> = async (request, trigger, Parse, config) => {
  const { object } = request;
  console.log('do trigger thing', trigger, object);
};

export default doTriggerThing;
