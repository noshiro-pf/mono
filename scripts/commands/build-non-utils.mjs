import { forEachPackages } from '../esm/index.mjs';
import { utilsDirs, wsrunStagesOptions } from './constants.mjs';

forEachPackages({
  prefixes: utilsDirs,
  treatPrefixesAsExcludeList: true,
  command: 'build',
  wsrunOptions: wsrunStagesOptions,
}).catch(console.error);
