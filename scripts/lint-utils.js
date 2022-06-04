'use strict';
// @ts-check

const { forEachPackages } = require('./foreach-package');

forEachPackages({
  prefixes: [
    'packages/utils',
    'packages/apps/lambda-calculus-interpreter-core',
    'packages/apps/event-schedule-app-shared',
  ],
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
