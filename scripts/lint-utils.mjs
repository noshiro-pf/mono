// @ts-check

import { forEachPackages } from './foreach-package.mjs';

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