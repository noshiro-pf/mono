import { generateAllGlobalDefs } from '@noshiro/mono-utils';
import 'zx/globals';
import packageJson from '../package.json' with { type: 'json' };

await generateAllGlobalDefs({
  rootDir: path.resolve(import.meta.dirname, '../'),
  packageName: packageJson.name.replace(/^@noshiro\/global-/u, '@noshiro/'),
  importsList: ['createRouter'],
  typeImportsList: [
    { name: 'Router', params: [] },
    { name: 'ReadonlyURLSearchParams', params: [] },
    { name: 'RouterState', params: [] },
    { name: 'UpdateQueryParamsOptions', params: [] },
  ],
});
