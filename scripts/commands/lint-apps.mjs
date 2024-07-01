import { forEachPackages } from '../esm/index.mjs';

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
}).catch(console.error);
