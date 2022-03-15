'use strict';

// @ts-check

/** @typedef { import("../../../../config/types/slides_paths").SlidesPaths } SlidesPaths */

const { resolveAppPath } = require('./app_directory');
const { dotenvValues } = require('./env');

/** @type {SlidesPaths} */
const paths = {
  appBuild: resolveAppPath('dist'),
  contentBase: resolveAppPath('public', true),
  template: resolveAppPath('public/index.html'),
  appIndexJs: resolveAppPath('public/index.js'),
  publicUrlOrPath: dotenvValues.PUBLIC_URL ?? '/',
};

module.exports = { paths };
