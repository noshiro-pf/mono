'use strict';
// @ts-check

const { ProvidePlugin } = require('webpack');

const {
  providePluginPreactDef,
} = require('@noshiro/global-preact/cjs/provide-plugin-def');
const {
  providePluginPreactUtilsDef,
} = require('@noshiro/global-preact-utils/cjs/provide-plugin-def');
const {
  providePluginSyncflowDef,
} = require('@noshiro/global-syncflow/cjs/provide-plugin-def');
const {
  providePluginSyncflowPreactHooksDef,
} = require('@noshiro/global-syncflow-preact-hooks/cjs/provide-plugin-def');
const {
  providePluginTsUtilsDef,
} = require('@noshiro/global-ts-utils/cjs/provide-plugin-def');
const {
  providePluginTinyRouterPreactHooksDef,
} = require('@noshiro/global-tiny-router-preact-hooks/cjs/provide-plugin-def');
const {
  providePluginGooberDef,
} = require('@noshiro/global-goober/cjs/provide-plugin-def');

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
      ...providePluginPreactDef,
      ...providePluginPreactUtilsDef,
      ...providePluginSyncflowDef,
      ...providePluginSyncflowPreactHooksDef,
      ...providePluginTsUtilsDef,
      ...providePluginTinyRouterPreactHooksDef,
      ...providePluginGooberDef,
    }),
  ]
);

module.exports = webpackConfigMerged;