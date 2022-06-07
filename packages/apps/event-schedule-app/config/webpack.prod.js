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
  webpackConfigReactProdMaker,
} = require('../../../../config/webpackconfig/react');
const { dotenvValues } = require('./env');
const { paths } = require('./paths');

console.log('use bundle analyzer: ', dotenvValues.USE_BUNDLE_ANALYZER);

const webpackConfigMerged = webpackConfigReactProdMaker(
  paths,
  'bundle.js',
  dotenvValues.USE_BUNDLE_ANALYZER,
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
