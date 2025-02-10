import { generateAllGlobalDefs, toThisDir } from '@noshiro/mono-utils';
import 'zx/globals';

await generateAllGlobalDefs({
  rootDir: path.resolve(toThisDir(import.meta.url), '../'),
  packageName: 'better-react-use-state',
  importsList: ['useState', 'useBoolState'],
  typeImportsList: [],
});
