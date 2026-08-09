import { forEachPackages } from '../esm/index.mjs';
import { pnpmParallelOptions, utilsDirs } from './constants.mjs';

forEachPackages({
  prefixes: utilsDirs,
  command: 'type-check',
  pnpmOptions: pnpmParallelOptions,
}).catch(console.error);
