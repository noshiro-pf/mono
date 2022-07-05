'use strict';

const { ProvidePlugin } = require('webpack');
const { providePluginTsUtilsDef } = require('@noshiro/global-ts-utils');

// @ts-check

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
  [new ProvidePlugin(providePluginTsUtilsDef)]
);

module.exports = webpackConfigMerged;
