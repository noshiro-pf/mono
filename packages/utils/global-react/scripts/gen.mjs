import { generateAllGlobalDefs, toThisDir } from '@noshiro/mono-scripts';
import * as nodePath from 'node:path';

await generateAllGlobalDefs({
  rootDir: nodePath.resolve(toThisDir(import.meta.url), '../'),
  packageName: 'react',
  importsList: ['useCallback', 'useEffect', 'useMemo', 'useReducer', 'useRef'],
  typeImportsList: [],
});
