import { forEachPackages } from './foreach-package.mjs';

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
    '--serial',
    '--ifDependency',
    '--report',
  ].join(' '),
}).catch(console.error);
