import { generateAllGlobalDefs, toThisDir } from '@noshiro/mono-utils';
import 'zx/globals';

await generateAllGlobalDefs({
  rootDir: path.resolve(toThisDir(import.meta.url), '../'),
  packageName: '@emotion/styled',
  importsList: [{ default: 'styled' }],
  typeImportsList: [],
});
