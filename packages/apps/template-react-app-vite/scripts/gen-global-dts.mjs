import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { genGlobalDts } from '../../../../scripts/gen-global-dts.mjs';
import packageJson from '../package.json' assert { type: 'json' };

const thisDir = dirname(fileURLToPath(import.meta.url));

genGlobalDts(join(thisDir, '../'), packageJson.devDependencies);
