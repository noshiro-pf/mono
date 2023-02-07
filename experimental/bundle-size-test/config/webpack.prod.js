'use strict';
// @ts-check

const { ProvidePlugin } = require('webpack');

const {
  genGlobalImportDefsFromDevDependencies,
} = require('../../../../scripts/get-global-import-def-from-dev-dependencies');

const {
  webpackConfigReactProdMaker,
} = require('../../../../config/webpackconfig/react');

const { dotenvValues } = require('./env');
const { paths } = require('./paths');

const packageJson = require('../package.json');

const thisDir = __dirname;

const providePluginDefs = genGlobalImportDefsFromDevDependencies(
  thisDir,
  packageJson.devDependencies
);

console.log('use bundle analyzer: ', dotenvValues.USE_BUNDLE_ANALYZER);

const webpackConfigMerged = webpackConfigReactProdMaker(
  paths,
  'bundle.js',
  dotenvValues.USE_BUNDLE_ANALYZER,
  [new ProvidePlugin({ ...providePluginDefs })]
);

module.exports = webpackConfigMerged;
