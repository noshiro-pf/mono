import { forEachPackages } from '../esm/index.mjs';
import { utilsDirs, wsrunOptions } from './constants.mjs';

forEachPackages({
  prefixes: utilsDirs,
  command: 'lint',
  wsrunOptions,
}).catch(console.error);
