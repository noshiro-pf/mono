'use strict';
// @ts-check

const { forEachPackages } = require('./foreach-package');

forEachPackages({
  prefixes: [
    'packages/utils',
    'packages/apps/lambda-calculus-interpreter-core',
    'packages/apps/event-schedule-app-shared',
  ],
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
