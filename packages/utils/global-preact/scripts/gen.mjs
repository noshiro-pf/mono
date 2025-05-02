import { generateAllGlobalDefs } from '@noshiro/mono-utils';
import 'zx/globals';

await generateAllGlobalDefs({
  rootDir: path.resolve(import.meta.dirname, '../'),
  packageName: 'preact/hooks',
  importsList: ['useCallback', 'useEffect', 'useMemo', 'useReducer', 'useRef'],
  typeImportsList: [],
});
