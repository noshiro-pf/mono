import { forEachPackages } from '../esm/index.mjs';

forEachPackages({
  prefixes: [
    'packages/utils',
    'packages/apps/lambda-calculus-interpreter-core',
    'packages/apps/event-schedule-app-shared',
  ],
  treatPrefixesAsExcludeList: true,
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