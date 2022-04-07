'use strict';

const { ProvidePlugin } = require('webpack');
const { providePluginTsUtilsDef } = require('@noshiro/global-ts-utils');

// @ts-check

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
  [new ProvidePlugin(providePluginTsUtilsDef)]
);

module.exports = webpackConfigMerged;
