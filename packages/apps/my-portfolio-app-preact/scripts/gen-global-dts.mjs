import { genGlobalDts, toThisDir } from '@noshiro/node-utils';
import * as nodePath from 'node:path';
import packageJson from '../package.json' assert { type: 'json' };

const thisDir = toThisDir(import.meta.url);

genGlobalDts(
  nodePath.resolve(thisDir, '../'),
  packageJson.devDependencies,
).catch(console.error);
