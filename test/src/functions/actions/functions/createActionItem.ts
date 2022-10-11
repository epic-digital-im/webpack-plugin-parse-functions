import { ClassNames } from '@@functions/types';
import { ActionItem, ServiceConfig } from '@@functions/actions';
import P from 'parse';

type PP = typeof P;

import crypto from 'crypto';


export const createHash = (obj: any) => {
  return crypto.createHash('md5').update(JSON.stringify(obj)).digest('hex');
}

async function createActionItem(request: any, Parse: PP, config?: ServiceConfig) {
  const {
    name,
    type,
    value,
    assignee,
    subjects,
    subjectClass,
    subjectId,
    description,
    resolved,
  } = request.params;

  const ActionItem = Parse.Object.extend(ClassNames.ActionItem);
  const ActionItemQuery = new Parse.Query(ActionItem);
  const item = {
    name,
    description,
    type,
    value,
    assignee,
    subjects,
    subjectId,
    subjectClass,
    resolved,
  };
  const md5 = createHash(item);

  ActionItemQuery.equalTo('md5', md5);

  let actionItem = await ActionItemQuery.first({ useMasterKey: true });

  if (!actionItem) {
    actionItem = new ActionItem({
      ...item,
      md5,
      reported: [new Date()],
    });
  } else {
    const reported = actionItem.get('reported') || [];
    reported.push(new Date());
    actionItem.set('reported', reported);
  }
  await actionItem?.save(null, { useMasterKey: true });
  return actionItem ? actionItem as ActionItem : undefined;
}

export default createActionItem;

export const config = { requireMaster: true };
