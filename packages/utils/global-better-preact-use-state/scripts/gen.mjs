import { generateAllGlobalDefs } from '@noshiro/mono-utils';
import 'zx/globals';

await generateAllGlobalDefs({
  rootDir: path.resolve(import.meta.dirname, '../'),
  packageName: 'better-preact-use-state',
  importsList: ['useBoolState', 'useState'],
  typeImportsList: [],
});
