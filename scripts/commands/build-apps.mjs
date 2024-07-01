import { forEachPackages } from '../esm/index.mjs';

forEachPackages({
  prefixes: ['packages/apps'],
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
