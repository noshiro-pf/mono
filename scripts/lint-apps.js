'use strict';
// @ts-check

const { forEachPackages } = require('./foreach-package');

forEachPackages({
  prefixes: ['packages/apps'],
  command: 'lint',
  wsrunOptions: [
    '--exclude-missing',
    '--fast-exit',
    '--prefix ',
    '--serial',
    '--ifDependency',
    '--report',
  ].join(' '),
});
