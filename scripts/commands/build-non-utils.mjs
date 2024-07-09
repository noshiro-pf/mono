import { forEachPackages } from '../esm/index.mjs';
import { utilsDirs, wsrunOptions } from './constants.mjs';

forEachPackages({
  prefixes: utilsDirs,
  treatPrefixesAsExcludeList: true,
  command: 'build',
  wsrunOptions,
}).catch(console.error);
