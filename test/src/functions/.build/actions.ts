// auto-generated file for actions
import P from "parse";
import { ActionTrigger, testTriggerCondition } from "./helpers";

import hook_beforeSave_config from "/Users/dustinchaffin/Developer/EpicDM/webpack-plugin-parse-functions/test/src/functions/actions/beforeSave/config";
import hook_beforeSave_hook from "/Users/dustinchaffin/Developer/EpicDM/webpack-plugin-parse-functions/test/src/functions/actions/beforeSave/0.hook";

import trigger_doTriggerThing from "/Users/dustinchaffin/Developer/EpicDM/webpack-plugin-parse-functions/test/src/functions/actions/triggers/doTriggerThing";
import doThing from "/Users/dustinchaffin/Developer/EpicDM/webpack-plugin-parse-functions/test/src/functions/actions/functions/doThing";

type ParseType = typeof P;

export interface ActionItemAttributes {
  objectId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  ACL?: string;
  name?: string;
  type?: string;
  value?: string;
  assignee?: string;
  subjectId?: string;
  description?: string;
  resolved: boolean;
  cm_id?: string;
  md5?: string;
  resolvedAt?: Date;
  subjectClass?: string;
  reported?: any[];
  subjects?: any[];
}

export type ActionItem = P.Object<ActionItemAttributes>;

const service = (Parse: ParseType) => {
  // HOOKS
  Parse.Cloud.beforeSave<ActionItem>(
    "ActionItem",
    async (request) => {
      await hook_beforeSave_hook(request);

      const triggerQuery = new Parse.Query<ActionTrigger>("ActionTrigger")
        .equalTo("trigger", "beforeSave")
        .equalTo("active", true);
      const triggers = await triggerQuery.findAll();
      const execTriggers = triggers.filter((trigger) => testTriggerCondition(trigger, request.object) == null);
      for (const t of execTriggers) {
        await Parse.Cloud.run(t.get("handler"), request);
      }
    },
    hook_beforeSave_config
  );

  // FUNCTIONS
  Parse.Cloud.define("doThing", doThing);

  // TRIGGER HANDLERS
  Parse.Cloud.define("doTriggerThing", trigger_doTriggerThing);
};

export default service;
