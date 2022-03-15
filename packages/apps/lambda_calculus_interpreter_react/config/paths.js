'use strict';

// @ts-check

/** @typedef { import("../../../../config/types/paths").Paths } Paths */

const { resolveAppPath } = require('./app_directory');
const { dotenvValues } = require('./env');

/** @type {Paths} */
const paths = {
  appBuild: resolveAppPath('build'),
  appIndexJs: resolveAppPath('src/index.tsx'),
  publicUrlOrPath: dotenvValues.PUBLIC_URL ?? '/',
  contentBase: resolveAppPath('public', true),
  tsconfigJson: resolveAppPath('tsconfig.json'),
};

module.exports = { paths };
