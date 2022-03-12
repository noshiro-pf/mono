'use strict';

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
  dotenvValues.USE_BUNDLE_ANALYZER
);

module.exports = webpackConfigMerged;
