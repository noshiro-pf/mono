const { join } = require('node:path');

const { genGlobalDts } = require('../../../../scripts/gen-global-dts');
const packageJson = require('../package.json');

genGlobalDts(join(__dirname, '../'), packageJson.devDependencies);
