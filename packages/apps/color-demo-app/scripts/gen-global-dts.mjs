import { genGlobalDts } from '@noshiro/mono-scripts/global-def/gen-global-dts.mjs';
import { toThisDir } from '@noshiro/mono-scripts/node-utils/path-utils.mjs';
import * as nodePath from 'node:path';
import packageJson from '../package.json' assert { type: 'json' };

const thisDir = toThisDir(import.meta.url);

genGlobalDts(
  nodePath.resolve(thisDir, '../'),
  packageJson.devDependencies,
).catch(console.error);
