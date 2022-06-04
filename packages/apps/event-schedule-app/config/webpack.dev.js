'use strict';

// @ts-check

const { ProvidePlugin } = require('webpack');

const {
  providePluginReactDef,
} = require('@noshiro/global-react/cjs/provide-plugin-def');
const {
  providePluginReactUtilsDef,
} = require('@noshiro/global-react-utils/cjs/provide-plugin-def');
const {
  providePluginStyledComponentsDef,
} = require('@noshiro/global-styled-components/cjs/provide-plugin-def');
const {
  providePluginSyncflowDef,
} = require('@noshiro/global-syncflow/cjs/provide-plugin-def');
const {
  providePluginSyncflowReactHooksDef,
} = require('@noshiro/global-syncflow-react-hooks/cjs/provide-plugin-def');
const {
  providePluginTsUtilsDef,
} = require('@noshiro/global-ts-utils/cjs/provide-plugin-def');

const {
  webpackConfigReactDevMaker,
} = require('../../../../config/webpackconfig/react');
const { dotenvValues } = require('./env');
const { paths } = require('./paths');

require('webpack-dev-server');

const webpackConfigMerged = webpackConfigReactDevMaker(
  paths,
  dotenvValues.HOST ?? 'localhost',
  Number(dotenvValues.PORT ?? 8080),
  'bundle.js',
  [
    new ProvidePlugin({
      ...providePluginTsUtilsDef,
      ...providePluginStyledComponentsDef,
      ...providePluginReactDef,
      ...providePluginReactUtilsDef,
      ...providePluginSyncflowDef,
      ...providePluginSyncflowReactHooksDef,
    }),
  ]
);

module.exports = webpackConfigMerged;
