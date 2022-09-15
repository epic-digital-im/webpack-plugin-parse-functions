<p align="center">
 <img width="100px" src="https://raw.githubusercontent.com/epicdigitalmedia/epic-ts-npm-boilerplate/main/.github/images/favicon512x512-npm.png" align="center" alt=":package: webpack-plugin-parse-functions" />
 <img width="100px" src="https://avatars.githubusercontent.com/u/113625277?s=200&v=4" align="center" alt=":package: webpack-plugin-parse-functions" />
 <h2 align="center">:package: webpack-plugin-parse-functions</h2>
 <p align="center">Parse Platform Function Plugin</p>
  <p align="center">
    <a href="https://github.com/epic-digital-im/webpack-plugin-parse-functions/issues/new/choose">Report Bug</a>
    <a href="https://github.com/epic-digital-im/webpack-plugin-parse-functions/issues/new/choose">Request Feature</a>
  </p>

<p align="center">
  <strong>Parse Platform Function Plugin</strong> 🚀
</p>

# Overview
This is a Webpack plugin designed to make development on top of the Parse Platform more seamless.

# Getting Started
## How it works
If you're familiar with Next.js, you know that the routes are built out based on the file structure of the project. This follows a similar methodology.

The default file structure looks like this:
- src
  - functions
    - `<serviceName>`
      - schema.json -- the schema of the `Parse.Object`-based service
      - `<hookName>`
        - `0.<hookName>.ts`
        - config.ts -- the configuration object to be passed to `Parse.Cloud.<hookName>(<className>, <handler>, <config>)`
      - functions
        - `<functionName>.ts` - functions to be defined with `Parse.Cloud.define('<functionName>', <function>)`
      - jobs
        - `<jobName>.ts` - jobs to be defined with `Parse.Cloud.job('<functionName>', <function>)`
      - triggers
        - `<triggerName>.ts` - post-hook triggers that will conditionally run `Parse.Cloud.run('<triggerName>', payload)`, where `payload` is the parameter of the running hook
    - `..<more services>...`

The available hooks are:
- beforeSave
- afterSave
- beforeDelete
- afterDelete
- TODO:
  - afterCreate
  - afterUpdate
  - beforeCreate
  - beforeUpdate
  - hourly
  - daily
  - weekly
  - monthly
  - datetime

## ActionTrigger
This is a special type of `Parse.Object` that is used to trigger cascading actions conditionally when a hook is run.

There are 4 conditions that must be met before an ActionTrigger will take effect:
- `ActionTrigger.active` is true
- `ActionTrigger.objectClass` matches the class of Parse.Object that is being run through the hook
- `object[ActionTrigger.property]` -> `ActionTrigger.condition` -> `ActionTrigger.value`. For example:
  - `user.email` -> `equalTo` -> `brenda@yahoo.com` -- this trigger will run only when the `User` instance's `email` property is equal to `brenda@yahoo.com`
- `ActionTrigger.handler` is equal to an extant trigger handler function name (i.e. in the `src/functions/<serviceName>/triggers/<someTriggerHandler>.ts`)

If your project doesn't need to trigger cascading function calls, you won't need to worry about this.

## How to Use
This is a normal Webpack plugin and can be used like so:

```js
// webpack.config.js
const path = require('path');
const ParseFunctionsPlugin = require('../dist/main').default;

const config = {
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new ParseFunctionsPlugin(),
  ],
  // ...and the rest
};
```

### Plugin Options
```js
{
  functionDirectory: <string>, // the directory to watch & build Parse functions
  moduleAlias: '@@functions',  // the alias name used for importing the built files from, e.g. `import intialize, { ClassNames } from '@@functions';`
}
```
The default option should be preferred, but there may be times where the project requires that you diverge from these naming conventions.

### On Build
When the plugin runs, it will aggregate the files (according to the file structure above) and transpile them into modules in a `.build` folder that may then be accessed by importing members from the `moduleAlias` (default `@@functions`);

# TODO
- [ ] Create custom hook handlers for:
  - [ ] beforeCreate -- fires before the initial creation of an object
  - [ ] afterCreate -- fires after the initial creation of an object
  - [ ] beforeUpdate -- fires before a previously created object is updated
  - [ ] afterUpdate -- fires after a previously created object is updated
  - [ ] hourly -- a cron job that fires hourly
  - [ ] daily -- a cron job that fires daily
  - [ ] weekly -- a cron job that fires weekly
  - [ ] monthly -- a cron job that fires monthly
  - [ ] datetime -- a cron job that fires on a specific datetime
- [ ] Rework functions, jobs, and triggers to export a factory function that takes a `Parse` instance as the first parameter, a configuration or context parameter, and returns a function
- [x] Make a `processTriggers` function to avoid duplicate code
