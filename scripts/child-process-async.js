'use strict';

// @ts-check

const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

module.exports = { execAsync };
