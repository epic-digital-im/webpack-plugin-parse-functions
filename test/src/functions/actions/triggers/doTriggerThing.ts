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
  const q = new Parse.Query(payload.get('objectClass'));
  const obj = q.get(payload.get('objectId'));
  console.log('do trigger thing', payload, obj);
};

export default doTriggerThing;
