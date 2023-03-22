'use strict';
// @ts-check

import { forEachPackages } from './foreach-package.mjs';

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
