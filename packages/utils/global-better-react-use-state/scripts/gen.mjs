import { generateAllGlobalDefs, toThisDir } from '@noshiro/mono-utils';
import * as nodePath from 'node:path';

await generateAllGlobalDefs({
  rootDir: nodePath.resolve(toThisDir(import.meta.url), '../'),
  packageName: 'better-react-use-state',
  importsList: ['useState', 'useBoolState'],
  typeImportsList: [],
});
