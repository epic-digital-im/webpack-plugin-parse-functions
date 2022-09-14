import type P from "parse";
import actions from "./actions";

type ParseType = typeof P;

interface ParseFunctionServiceSchema {
  className: string;
  fields: {
    [key: string]: ParseFunctionServiceSchemaField;
  };
  [key: string]: any;
}

type ParseFunctionServiceSchemaField = {
  type: string;
  targetClass?: string;
  required?: boolean;
  defaultValue?: any;
};

const initialize = (Parse: ParseType) => {
  actions(Parse);
};

export enum ClassNames {
  ActionItem = "ActionItem",
}

export type SchemaMap = {
  [prop in ClassNames]: ParseFunctionServiceSchema;
};

export const Schemas: SchemaMap = {
  ActionItem: {
    className: "ActionItem",
    fields: {
      objectId: {
        type: "String",
      },
      createdAt: {
        type: "Date",
      },
      updatedAt: {
        type: "Date",
      },
      ACL: {
        type: "ACL",
      },
      name: {
        type: "String",
      },
      type: {
        type: "String",
      },
      value: {
        type: "String",
      },
      assignee: {
        type: "String",
        required: false,
      },
      subjectId: {
        type: "String",
        required: false,
      },
      description: {
        type: "String",
        required: false,
      },
      resolved: {
        type: "Boolean",
        required: true,
        defaultValue: false,
      },
      cm_id: {
        type: "String",
      },
      md5: {
        type: "String",
        required: false,
      },
      resolvedAt: {
        type: "Date",
        required: false,
      },
      subjectClass: {
        type: "String",
        required: false,
      },
      reported: {
        type: "Array",
        required: false,
      },
      subjects: {
        type: "Array",
      },
    },
    classLevelPermissions: {
      find: {
        "*": true,
      },
      count: {
        "*": true,
      },
      get: {
        "*": true,
      },
      create: {
        "*": true,
      },
      update: {
        "*": true,
      },
      delete: {
        "*": true,
      },
      addField: {},
      protectedFields: {
        "*": [
          "subjects",
          "subjectId",
          "resolvedAt",
          "name",
          "subjectClass",
          "assignee",
          "cm_id",
          "reported",
          "resolved",
          "value",
          "type",
          "description",
          "md5",
        ],
        "role:admin": [],
        "role:viewer": [
          "subjects",
          "subjectId",
          "resolvedAt",
          "subjectClass",
          "type",
          "value",
          "assignee",
          "description",
          "resolved",
          "cm_id",
          "md5",
          "reported",
        ],
        "role:editor": [],
      },
    },
    indexes: {
      _id_: {
        _id: 1,
      },
    },
  },
};

export default initialize;
