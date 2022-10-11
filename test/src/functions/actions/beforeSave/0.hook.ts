// import { ClassNames } from '@@functions';
import { BeforeSaveHandler } from '@@functions/types';
import { ActionItem, ServiceConfig } from '@@functions/actions';
import P from 'parse';

type PP = typeof P;


let aclSchema: {
  [key: string]: {
    read?: boolean,
    write?: boolean,
  }
} = {
  "role:editor": {
    "read": true,
    "write": true
  },
  "role:viewer": {
    "read": true
  }
}

const beforeSave: BeforeSaveHandler<ActionItem, ServiceConfig> = async (request: any, Parse: PP, config?: ServiceConfig) => {
  const object = request.object;
  // await setCmId(ClassNames.ActionItem, config)(request);
  const acl = new Parse.ACL(aclSchema);
  object.setACL(acl);
}

export default beforeSave;
