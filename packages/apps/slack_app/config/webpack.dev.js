'use strict';

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
  'bundle.js'
);

module.exports = webpackConfigMerged;
