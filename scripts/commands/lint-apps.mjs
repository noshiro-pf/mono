import { forEachPackages } from '../esm/index.mjs';
import { pnpmParallelOptions } from './constants.mjs';

forEachPackages({
  prefixes: ['packages/apps'],
  command: 'lint',
  pnpmOptions: pnpmParallelOptions,
}).catch(console.error);
