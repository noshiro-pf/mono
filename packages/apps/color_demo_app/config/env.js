'use strict';

// @ts-check

/** @typedef { import("../../../../config/types/dotenv-values").DotEnvValues } DotEnvValues */

const dotenv = require('dotenv');
const { resolveAppPath } = require('./app_directory');

const dotenvConfigOutput = dotenv.config({
  path: resolveAppPath('.env.webpack'),
});
const dotenvParsed = dotenvConfigOutput.parsed;

/** @type {DotEnvValues} */
const dotenvValues = {
  USE_BUNDLE_ANALYZER: dotenvParsed?.['USE_BUNDLE_ANALYZER'] === 'true',
  HOST: dotenvParsed?.['HOST'],
  PORT:
    dotenvParsed?.['PORT'] === undefined
      ? undefined
      : Number(dotenvParsed['PORT']),
  PUBLIC_URL: dotenvParsed?.['PUBLIC_URL'],
};

module.exports = { dotenvValues };
