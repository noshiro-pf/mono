'use strict';

// @ts-check

const { writeFile } = require('fs');
const { promisify } = require('util');

const writeFileAsync = promisify(writeFile);

module.exports = { writeFileAsync };
