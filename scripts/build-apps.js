'use strict';
// @ts-check

const { forEachPackages } = require('./foreach-package');

forEachPackages({
  prefixes: ['packages/apps'],
  command: 'build',
  wsrunOptions: [
    '--exclude-missing',
    '--fast-exit',
    '--prefix ',
    '--stages',
    '--ifDependency',
    '--report',
  ].join(' '),
});
