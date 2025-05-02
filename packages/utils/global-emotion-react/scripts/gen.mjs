import { generateAllGlobalDefs } from '@noshiro/mono-utils';
import 'zx/globals';

await generateAllGlobalDefs({
  rootDir: path.resolve(import.meta.dirname, '../'),
  packageName: '@emotion/react',
  importsList: ['css'],
  typeImportsList: [],
});
