import * as Parse from 'parse';
import {
  testTriggerCondition,
  ActionTriggerCondition,
  ActionTriggerAttributes,
} from '@@functions/helpers';

interface TestObject {
  exists?: string;
  doesNotExist?: null;
  startsWithFoo: string;
  endsWithBar: string;
}

console.log('parse', Parse);

describe('string values', () => {
  const trigger = new Parse.Object<ActionTriggerAttributes>('ActionTrigger', {
    id: '0',
    createdAt: new Date(),
    updatedAt: new Date(),
    objectClass: 'Event',
    objectId: '0',
    name: 'test trigger 1',
    type: 'afterSave',
    condition: ActionTriggerCondition.DoesNotExist,
    property: 'doesNotExist',
    value: null,
    active: true,
    trigger: 'string',
    handler: 'string',
    payload: {},
  });
  
  const object = new Parse.Object<TestObject>('TestObject', {
    exists: 'exists',
    doesNotExist: null,
    startsWithFoo: 'foo',
    endsWithBar: 'bar',
  });

  test(`Condition: ${ActionTriggerCondition.DoesNotExist}`, async () => {
    const message = await testTriggerCondition(trigger, object);
    console.log('test', message);
  });
  
  // test(`Condition: ${ActionTriggerCondition.Exists}`, async () => {
  //   const message = await testTriggerCondition(trigger, object);
  //   console.log('test', message);
  // });
});
