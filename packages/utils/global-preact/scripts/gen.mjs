import { generateAllGlobalDefs } from '@noshiro/mono-scripts/global-def/generate-global-util-src.mjs';
import { toThisDir } from '@noshiro/mono-scripts/node-utils/path-utils.mjs';
import * as nodePath from 'node:path';

await generateAllGlobalDefs({
  rootDir: nodePath.resolve(toThisDir(import.meta.url), '../'),
  packageName: 'preact/hooks',
  importsList: ['useCallback', 'useEffect', 'useMemo', 'useReducer', 'useRef'],
  typeImportsList: [],
});
