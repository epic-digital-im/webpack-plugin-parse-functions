// auto-generated file for actions
import P from "parse";
import { ActionTrigger, testTriggerCondition } from "./helpers";

import hook_afterSave_hook from "/Users/dustinchaffin/Developer/EpicDM/webpack-plugin-parse-functions/test/src/functions/actions/afterSave/0.hook";

import hook_beforeSave_config from "/Users/dustinchaffin/Developer/EpicDM/webpack-plugin-parse-functions/test/src/functions/actions/beforeSave/config";
import hook_beforeSave_hook from "/Users/dustinchaffin/Developer/EpicDM/webpack-plugin-parse-functions/test/src/functions/actions/beforeSave/0.hook";
import hook_beforeDelete_hook from "/Users/dustinchaffin/Developer/EpicDM/webpack-plugin-parse-functions/test/src/functions/actions/beforeDelete/0.hook";

import trigger_doTriggerThing from "/Users/dustinchaffin/Developer/EpicDM/webpack-plugin-parse-functions/test/src/functions/actions/triggers/doTriggerThing";
import createActionItem from "/Users/dustinchaffin/Developer/EpicDM/webpack-plugin-parse-functions/test/src/functions/actions/functions/createActionItem";
import doThing from "/Users/dustinchaffin/Developer/EpicDM/webpack-plugin-parse-functions/test/src/functions/actions/functions/doThing";
import job_someJob from "/Users/dustinchaffin/Developer/EpicDM/webpack-plugin-parse-functions/test/src/functions/actions/jobs/0.someJob";

/* === TYPES === */
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

/* === CONSTANTS === */
const defaultFunctionConfig = {
  requireUser: true,
  requireAnyUserRoles: ["editor"],
};

const defaultJobConfig = {
  requireUser: true,
  requireAnyUserRoles: ["editor"],
  requireMaster: true,
};

const defaultTriggerConfig = {
  requireUser: true,
  requireAnyUserRoles: ["editor"],
  requireMaster: true,
};

/* === SERVICE === */
const service = (Parse: ParseType) => {
  // HOOKS
  Parse.Cloud.afterSave<ActionItem>("ActionItem", async (request) => {
    await hook_afterSave_hook(request);

    const triggerQuery = new Parse.Query<ActionTrigger>("ActionTrigger")
      .equalTo("trigger", "afterSave")
      .equalTo("active", true);
    const triggers = await triggerQuery.findAll();
    const execTriggers = triggers.filter((trigger) => testTriggerCondition(trigger, request.object) == null);
    for (const t of execTriggers) {
      await Parse.Cloud.run(t.get("handler"), request);
    }
  });

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

  Parse.Cloud.beforeDelete<ActionItem>("ActionItem", async (request) => {
    await hook_beforeDelete_hook(request);

    const triggerQuery = new Parse.Query<ActionTrigger>("ActionTrigger")
      .equalTo("trigger", "beforeDelete")
      .equalTo("active", true);
    const triggers = await triggerQuery.findAll();
    const execTriggers = triggers.filter((trigger) => testTriggerCondition(trigger, request.object) == null);
    for (const t of execTriggers) {
      await Parse.Cloud.run(t.get("handler"), request);
    }
  });

  // FUNCTIONS
  Parse.Cloud.define(
    "createActionItem",
    createActionItem,
    require("/Users/dustinchaffin/Developer/EpicDM/webpack-plugin-parse-functions/test/src/functions/actions/functions/createActionItem.ts")
      ?.config || defaultFunctionConfig
  );
  Parse.Cloud.define(
    "doThing",
    doThing,
    require("/Users/dustinchaffin/Developer/EpicDM/webpack-plugin-parse-functions/test/src/functions/actions/functions/doThing.ts")
      ?.config || defaultFunctionConfig
  );

  // JOBS
  Parse.Cloud.job("someJob", job_someJob);

  // TRIGGER HANDLERS
  Parse.Cloud.define(
    "doTriggerThing",
    trigger_doTriggerThing,
    require("/Users/dustinchaffin/Developer/EpicDM/webpack-plugin-parse-functions/test/src/functions/actions/triggers/doTriggerThing.ts")
      ?.config || defaultTriggerConfig
  );
};

export default service;
