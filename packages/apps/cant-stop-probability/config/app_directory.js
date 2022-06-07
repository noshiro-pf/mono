'use strict';

// @ts-check

const { realpathSync } = require('fs');
const {
  pathResolverMaker,
} = require('../../../../scripts/path_resolver_maker');

// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebook/create-react-app/issues/637
const appDirectory = realpathSync(process.cwd());

const resolveAppPath = pathResolverMaker(appDirectory);

module.exports = { resolveAppPath };
