import P from "parse";

type Parse = typeof P;

export interface ActionTriggerAttributes {
  id: string;
  objectId: string;
  createdAt: Date;
  updatedAt: Date;
  name?: string;
  type?: string;
  objectClass: string;
  condition: string;
  property?: string;
  value?: string;
  active?: boolean;
  trigger: string;
  handler: string;
}

export type ActionTrigger = Parse.Object<ActionTriggerAttributes>;

export enum ActionCondition {
  Exists = "exists",
  DoesNotExist = "does not exist",
  Equals = "equals",
  Contains = "contains",
  StartsWith = "startsWith",
  EndsWith = "endsWith",
  LessThan = "lessThan",
  LessThanOrEqualTo = "lessThanOrEqualTo",
  GreaterThan = "greaterThan",
  GreaterThanOrEqualTo = "greaterThanOrEqualTo",
  Unique = "unique",
  NotUnique = "not unique",
}

export async function testTriggerCondition<T extends Parse.Object = Parse.Object>(
  trigger: ActionTrigger,
  obj: T
): Promise<string | undefined> {
  const condition = trigger.get("condition") as ActionCondition | undefined;
  const property = trigger.get("property");
  const value = trigger.get("value");
  if (condition == null || property == null) return;

  const propertyValue = obj.get(property);
  const n1 = Number(propertyValue);
  const n2 = Number(value);
  const q = new Parse.Query(obj.className).equalTo(property, propertyValue);

  switch (condition) {
    case ActionCondition.Exists:
      return value != null ? undefined : `Property '${property}' does not exist`;
    case ActionCondition.DoesNotExist:
      return value == null ? undefined : `Property '${property}' exists (and should not)`;
    case ActionCondition.Contains:
      return !!propertyValue?.includes(value)
        ? undefined
        : `Property '${property}' does not contain value '${value}'`;
    case ActionCondition.Equals:
      return value === propertyValue ? undefined : `Property '${property}' does not equal value '${value}`;
    case ActionCondition.StartsWith:
      return propertyValue?.indexOf(value) === 0
        ? undefined
        : `Property '${property}' does not start with value '${value}'`;
    case ActionCondition.EndsWith:
      const endsWith =
        propertyValue && value ? propertyValue.indexOf(value) === propertyValue.length - value.length : false;
      return endsWith ? undefined : `Property '${property}' does not end with value '${value}'`;
    case ActionCondition.LessThan:
      const isLessThan = !isNaN(n1) && !isNaN(n2) ? n1 < n2 : false;
      return isLessThan ? undefined : `Property '${property}' `;
    case ActionCondition.LessThanOrEqualTo:
      const isLessThanOrEqualTo = !isNaN(n1) && !isNaN(n2) ? n1 <= n2 : false;
      return isLessThanOrEqualTo
        ? undefined
        : `Property '${property}' is not less than or equal to value '${value}'`;
    case ActionCondition.GreaterThan:
      const isGreaterThan = !isNaN(n1) && !isNaN(n2) ? n1 > n2 : false;
      return isGreaterThan ? undefined : `Property '${property}' is not greater than value '${value}'`;
    case ActionCondition.GreaterThanOrEqualTo:
      const isGreaterThanOrEqualTo = !isNaN(n1) && !isNaN(n2) ? n1 >= n2 : false;
      return isGreaterThanOrEqualTo
        ? undefined
        : `Property '${property}' is not greater than or equal to value '${value}'`;
    case ActionCondition.Unique:
      const res1 = await q.findAll({ useMasterKey: true });
      return res1.length === 0 ? undefined : `Property '${property}' is not unique, with value '${value}'`;
    case ActionCondition.NotUnique:
      const res2 = await q.findAll({ useMasterKey: true });
      return res2.length > 0
        ? undefined
        : `Property '${property}' is unique (and should not be), with value '${value}'`;
  }
}

interface ProcessActionTriggerParams<T extends Parse.Object = Parse.Object> {
  object: T;
  triggerName: string;
}

export async function processActionTriggers<T extends Parse.Object = Parse.Object>(
  params: ProcessActionTriggerParams<T>
) {
  const { triggerName, object } = params;
  const actionTriggerQuery = new Parse.Query<ActionTrigger>("ActionTrigger")
    .equalTo("active", true)
    .equalTo("objectClass", object.className)
    .equalTo("trigger", triggerName);
  const triggers = await actionTriggerQuery.findAll();

  for (const trigger of triggers) {
    const conditionMessage = await testTriggerCondition(trigger, object);

    if (conditionMessage != null) {
      // console.warn('[ACTION TRIGGER]', conditionMessage);
      continue;
    }

    const handler = trigger.get("handler");
    await Parse.Cloud.run(handler, object);
  }
}
