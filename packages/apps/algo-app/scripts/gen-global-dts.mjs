import { genGlobalDts, toThisDir } from '@noshiro/mono-scripts';
import * as nodePath from 'node:path';
import packageJson from '../package.json' with { type: 'json' };

const thisDir = toThisDir(import.meta.url);

genGlobalDts(
  nodePath.resolve(thisDir, '../'),
  packageJson.devDependencies,
).catch(console.error);
