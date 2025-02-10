import { generateAllGlobalDefs, toThisDir } from '@noshiro/mono-utils';
import 'zx/globals';
import packageJson from '../package.json' with { type: 'json' };

await generateAllGlobalDefs({
  rootDir: path.resolve(toThisDir(import.meta.url), '../'),
  packageName: packageJson.name.replace(/^@noshiro\/global-/u, '@noshiro/'),
  importsList: ['createRouter'],
  typeImportsList: [
    { name: 'Router', params: [] },
    { name: 'ReadonlyURLSearchParams', params: [] },
    { name: 'RouterState', params: [] },
    { name: 'UpdateQueryParamsOptions', params: [] },
  ],
});
