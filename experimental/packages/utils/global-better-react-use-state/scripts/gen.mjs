import { generateAllGlobalDefs } from '@noshiro/mono-utils';
import 'zx/globals';

await generateAllGlobalDefs({
  rootDir: path.resolve(import.meta.dirname, '../'),
  packageName: 'better-react-use-state',
  importsList: ['useState', 'useBoolState'],
  typeImportsList: [],
});
