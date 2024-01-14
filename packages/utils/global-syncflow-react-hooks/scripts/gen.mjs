import { generateAllGlobalDefs } from '@noshiro/mono-scripts/global-def/generate-global-util-src.mjs';
import { toThisDir } from '@noshiro/mono-scripts/node-utils/path-utils.mjs';
import * as nodePath from 'node:path';
import packageJson from '../package.json' assert { type: 'json' };

await generateAllGlobalDefs({
  rootDir: nodePath.resolve(toThisDir(import.meta.url), '../'),
  packageName: packageJson.name.replace(/^@noshiro\/global-/u, '@noshiro/'),
  importsList: [
    'useEventObservable',
    'useObservable',
    'useObservableEffect',
    'useObservableReducer',
    'useObservableState',
    'useObservableValue',
    'useValueAsObservable',
    'useVoidEventObservable',
  ],
  typeImportsList: [],
});
