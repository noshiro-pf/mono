import { forEachPackages } from '../esm/index.mjs';
import { wsrunOptions } from './constants.mjs';

forEachPackages({
  prefixes: ['packages/apps'],
  command: 'lint',
  wsrunOptions,
}).catch(console.error);
