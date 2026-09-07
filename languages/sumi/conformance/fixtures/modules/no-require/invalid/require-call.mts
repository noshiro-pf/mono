// @sumi-expect modules/no-require
const fs = require('node:fs');

export const exists = fs.existsSync('.');
