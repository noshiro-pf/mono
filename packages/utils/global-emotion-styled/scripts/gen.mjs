import { generateAllGlobalDefs, toThisDir } from '@noshiro/mono-scripts';
import * as nodePath from 'node:path';
await generateAllGlobalDefs({
  rootDir: nodePath.resolve(toThisDir(import.meta.url), '../'),
  packageName: '@emotion/styled',
  importsList: [{ default: 'styled' }],
  typeImportsList: [],
});
