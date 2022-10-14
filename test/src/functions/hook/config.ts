import { BaseServiceConfig } from '@@functions/types';

export interface ServiceConfig extends BaseServiceConfig {

}

const defaultConfig: ServiceConfig = {
  aclSchema: {
    "role:editor": {
      "read": true,
      "write": true
    },
    "role:viewer": {
      "read": true
    }
  },
};

export default defaultConfig;
