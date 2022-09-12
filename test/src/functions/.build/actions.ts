// auto-generated file for actions
import P from 'parse';
import hook from '/Users/dustinchaffin/Developer/EpicDM/webpack-plugin-parse-functions/test/src/functions/actions/beforeSave/0.hook';

import doThing from '/Users/dustinchaffin/Developer/EpicDM/webpack-plugin-parse-functions/test/src/functions/actions/functions/doThing';

type ParseType = typeof P;


export interface ActionItemAttributes {
  objectId?: string
  createdAt?: Date
  updatedAt?: Date
  ACL?: string
  name?: string
  type?: string
  value?: string
  assignee?: string
  subjectId?: string
  description?: string
  resolved: boolean
  cm_id?: string
  md5?: string
  resolvedAt?: Date
  subjectClass?: string
  reported?: any[]
  subjects?: any[]
}

export type ActionItem = P.Object<ActionItemAttributes>;


const service = (Parse: ParseType) => {

  Parse.Cloud.beforeSave<ActionItem>('ActionItem', async (request) => {
    await hook(request);
  });
  
  Parse.Cloud.define('doThing', doThing);
};

export default service;
