import { generateAllGlobalDefs, toThisDir } from '@noshiro/mono-utils';
import 'zx/globals';

await generateAllGlobalDefs({
  rootDir: path.resolve(toThisDir(import.meta.url), '../'),
  packageName: 'preact/hooks',
  importsList: ['useCallback', 'useEffect', 'useMemo', 'useReducer', 'useRef'],
  typeImportsList: [],
});
