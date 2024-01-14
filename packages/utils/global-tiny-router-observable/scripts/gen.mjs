import { generateAllGlobalDefs } from '@noshiro/mono-scripts/global-def/generate-global-util-src.mjs';
import { toThisDir } from '@noshiro/mono-scripts/node-utils/path-utils.mjs';
import * as nodePath from 'node:path';
import packageJson from '../package.json' assert { type: 'json' };

await generateAllGlobalDefs({
  rootDir: nodePath.resolve(toThisDir(import.meta.url), '../'),
  packageName: packageJson.name.replace(/^@noshiro\/global-/u, '@noshiro/'),
  importsList: ['createRouter'],
  typeImportsList: [
    { name: 'Router', params: [] },
    { name: 'ReadonlyURLSearchParams', params: [] },
    { name: 'RouterState', params: [] },
    { name: 'UpdateQueryParamsOptions', params: [] },
  ],
});
