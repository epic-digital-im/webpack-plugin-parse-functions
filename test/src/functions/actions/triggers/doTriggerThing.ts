import { ServiceConfig, ActionItem } from '@@functions/actions';
import { TriggerHandler, TriggerPayloadSchema } from '@@functions/helpers';
import P from 'parse';

type PP = typeof P;

export const payloadSchema: TriggerPayloadSchema = {
  something: {
    type: 'String',
    defaultValue: 'something',
    required: true,
  }
};

const doTriggerThing: TriggerHandler<ServiceConfig> = (request, Parse, config) => {
  const payload = request.params;
  
};

export default doTriggerThing;
