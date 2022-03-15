'use strict';
// @ts-check

const { forEachPackages } = require('./foreach-package');

forEachPackages({
  prefixes: [
    'packages/utils',
    'packages/apps/lambda_calculus_interpreter_core',
    'packages/apps/event_schedule_app_shared',
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
