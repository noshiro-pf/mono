import { generateAllGlobalDefs, toThisDir } from '@noshiro/mono-scripts';
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
    'createBooleanState',
    'createReducer',
    'createState',
  ],
  typeImportsList: [],
});
