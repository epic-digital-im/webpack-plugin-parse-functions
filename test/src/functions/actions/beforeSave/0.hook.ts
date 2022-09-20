// import { ClassNames } from '@@functions';
import { ServiceConfig } from '@@functions/actions';
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

async function beforeSave(request: any, Parse: PP, config?: ServiceConfig) {
  const object = request.object;
  // await setCmId(ClassNames.ActionItem, config)(request);
  const acl = new Parse.ACL(aclSchema);
  object.setACL(acl);
}

export default beforeSave;
