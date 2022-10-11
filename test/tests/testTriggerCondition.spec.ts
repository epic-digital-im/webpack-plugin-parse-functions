import * as Parse from 'parse';
import {
  testTriggerCondition,
} from '@@functions/helpers';
import {
  ActionTriggerCondition,
  ActionTriggerAttributes,
  ActionTrigger,
} from '@@functions/types';

type SuccessObject = {
  exists?: string;
  doesNotExist?: null;
  startsWith: string;
  endsWith: string;
  containsString: string;
  containsArray: string[];
  equalsString: string;
  equalsNumber: number;
  greaterThan: number;
  greaterThanOrEqualTo: number;
  lessThan: number;
  lessThanOrEqualTo: number;
}

type FailObject = {
  [prop in keyof SuccessObject]: any;
}

const DEFAULT_TRIGGER_ATTRIBUTES: ActionTriggerAttributes = {
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
};

function createTrigger(attrs?: Partial<ActionTriggerAttributes>): ActionTrigger {
  const a = Object.assign({}, DEFAULT_TRIGGER_ATTRIBUTES, attrs || {});
  return new Parse.Object<ActionTriggerAttributes>('ActionTrigger', a);
}

describe('string values', () => {
  const object = new Parse.Object<SuccessObject>('SuccessObject', {
    exists: 'exists',
    doesNotExist: null,
    startsWith: 'foo is a starting word',
    endsWith: 'an ending word is bar',
    containsString: 'it contains a thing',
    containsArray: ['contains a thing'],
    equalsString: 'equals',
    equalsNumber: 0,
    greaterThan: 1,
    greaterThanOrEqualTo: 1,
    lessThan: -1,
    lessThanOrEqualTo: -1,
  });
  const failObject = new Parse.Object<FailObject>('FailObject', {
    exists: null,
    doesNotExist: 'null',
    startsWith: 'a starting word is foo',
    endsWith: 'bar is an ending word',
    containsString: 'it has a thing',
    containsArray: ['has a thing'],
    equalsString: 'not equals',
    equalsNumber: 1,
    greaterThan: 0,
    greaterThanOrEqualTo: -1,
    lessThan: 1,
    lessThanOrEqualTo: 1,
  });

  test(`Condition: ${ActionTriggerCondition.DoesNotExist}`, async () => {
    const trigger = createTrigger();
    const success = await testTriggerCondition(trigger, object);
    const fail = await testTriggerCondition(trigger, failObject);
    expect(success).toBeUndefined();
    expect(typeof fail).toBe('string');
  });
  
  test(`Condition: ${ActionTriggerCondition.Exists}`, async () => {
    const trigger = createTrigger({
      condition: ActionTriggerCondition.Exists,
      property: 'exists',
    });
    const success = await testTriggerCondition(trigger, object);
    const fail = await testTriggerCondition(trigger, failObject);
    expect(success).toBeUndefined();
    expect(typeof fail).toBe('string');
  });
  
  test(`Condition: ${ActionTriggerCondition.Contains} - String`, async () => {
    const trigger = createTrigger({
      condition: ActionTriggerCondition.Contains,
      property: 'containsString',
      value: 'contains',
    });
    const success = await testTriggerCondition(trigger, object);
    const fail = await testTriggerCondition(trigger, failObject);
    expect(success).toBeUndefined();
    expect(typeof fail).toBe('string');
  });
  
  test(`Condition: ${ActionTriggerCondition.Contains} - Array<String>`, async () => {
    const trigger = createTrigger({
      condition: ActionTriggerCondition.Contains,
      property: 'containsArray',
      value: 'contains a thing',
    });
    const success = await testTriggerCondition(trigger, object);
    const fail = await testTriggerCondition(trigger, failObject);
    expect(success).toBeUndefined();
    expect(typeof fail).toBe('string');
  });
  
  test(`Condition: ${ActionTriggerCondition.StartsWith}`, async () => {
    const trigger = createTrigger({
      condition: ActionTriggerCondition.StartsWith,
      property: 'startsWith',
      value: 'foo',
    });
    const success = await testTriggerCondition(trigger, object);
    const fail = await testTriggerCondition(trigger, failObject);
    expect(success).toBeUndefined();
    expect(typeof fail).toBe('string');
  });
  
  test(`Condition: ${ActionTriggerCondition.EndsWith}`, async () => {
    const trigger = createTrigger({
      condition: ActionTriggerCondition.EndsWith,
      property: 'endsWith',
      value: 'bar',
    });
    const success = await testTriggerCondition(trigger, object);
    const fail = await testTriggerCondition(trigger, failObject);
    expect(success).toBeUndefined();
    expect(typeof fail).toBe('string');
  });
  
  test(`Condition: ${ActionTriggerCondition.Equals}`, async () => {
    const trigger = createTrigger({
      condition: ActionTriggerCondition.Equals,
      property: 'equalsString',
      value: 'equals',
    });
    const success = await testTriggerCondition(trigger, object);
    const fail = await testTriggerCondition(trigger, failObject);
    expect(success).toBeUndefined();
    expect(typeof fail).toBe('string');
  });
  
  test(`Condition: ${ActionTriggerCondition.GreaterThan}`, async () => {
    const trigger = createTrigger({
      condition: ActionTriggerCondition.GreaterThan,
      property: 'greaterThan',
      value: 0,
    });
    const success = await testTriggerCondition(trigger, object);
    const fail = await testTriggerCondition(trigger, failObject);
    expect(success).toBeUndefined();
    expect(typeof fail).toBe('string');
  });
  
  test(`Condition: ${ActionTriggerCondition.GreaterThanOrEqualTo}`, async () => {
    const trigger = createTrigger({
      condition: ActionTriggerCondition.GreaterThanOrEqualTo,
      property: 'greaterThanOrEqualTo',
      value: 1,
    });
    const success = await testTriggerCondition(trigger, object);
    const fail = await testTriggerCondition(trigger, failObject);
    expect(success).toBeUndefined();
    expect(typeof fail).toBe('string');
  });
  
  test(`Condition: ${ActionTriggerCondition.LessThan}`, async () => {
    const trigger = createTrigger({
      condition: ActionTriggerCondition.LessThan,
      property: 'lessThan',
      value: 0,
    });
    const success = await testTriggerCondition(trigger, object);
    const fail = await testTriggerCondition(trigger, failObject);
    expect(success).toBeUndefined();
    expect(typeof fail).toBe('string');
  });
  
  test(`Condition: ${ActionTriggerCondition.LessThanOrEqualTo}`, async () => {
    const trigger = createTrigger({
      condition: ActionTriggerCondition.LessThanOrEqualTo,
      property: 'lessThanOrEqualTo',
      value: -1,
    });
    const success = await testTriggerCondition(trigger, object);
    const fail = await testTriggerCondition(trigger, failObject);
    expect(success).toBeUndefined();
    expect(typeof fail).toBe('string');
  });
});
