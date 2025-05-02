import { genGlobalDts } from '@noshiro/mono-utils';
import 'zx/globals';
import packageJson from '../package.json' with { type: 'json' };

const thisDir = import.meta.dirname;

genGlobalDts(path.resolve(thisDir, '../'), packageJson.devDependencies).catch(
  console.error,
);
