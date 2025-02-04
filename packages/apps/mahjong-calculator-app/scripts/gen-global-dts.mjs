import { genGlobalDts, toThisDir } from '@noshiro/mono-utils';
import 'zx/globals';
import packageJson from '../package.json' with { type: 'json' };

const thisDir = toThisDir(import.meta.url);

genGlobalDts(path.resolve(thisDir, '../'), packageJson.devDependencies).catch(
  console.error,
);
