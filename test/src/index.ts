import initialize from '@@functions';
import 'parse/node';
// @ts-ignore
import { ParseServer } from 'parse-server';
import express from 'express';
import config from './config';


export function run(): Promise<typeof Parse> {
  return new Promise((res, rej) => {
    try {
      const app = express();
      const api = new ParseServer(config);
      const port = 1333;
      
      Parse.serverURL = `http://localhost:${port}/parse`
      Parse.initialize(config.appId, config.javascriptKey, config.masterKey);
      initialize(Parse);
  
      console.log('initialized Parse');
      
      app.use('/parse', api);
      app.listen(port, () => {
        console.log('initialized Express');
        console.log('webpack-plugin-parse-functions running on', port);
        res(Parse);
      });
      
      return Parse;
    } catch(err) {
      console.warn(err.message);
      throw err;
    }
  });
}

export default run;
