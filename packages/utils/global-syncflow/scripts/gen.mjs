import { generateAllGlobalDefs, toThisDir } from '@noshiro/mono-scripts';
import * as nodePath from 'node:path';
import packageJson from '../package.json' assert { type: 'json' };

await generateAllGlobalDefs({
  rootDir: nodePath.resolve(toThisDir(import.meta.url), '../'),
  packageName: packageJson.name.replace(/^@noshiro\/global-/u, '@noshiro/'),
  importsList: [
    'auditTime',
    'combine',
    'createEventEmitter',
    'createVoidEventEmitter',
    'debounceTime',
    'filter',
    'fromPromise',
    'map',
    'mapMaybe',
    'mapResultErr',
    'mapResultOk',
    'mapTo',
    'mapWithIndex',
    'of',
    'pairwise',
    'pluck',
    'scan',
    'setInitialValue',
    'skip',
    'skipIfNoChange',
    'source',
    'throttleTime',
    'unwrapMaybe',
    'unwrapResultErr',
    'unwrapResultOk',
    'withCurrentValueFrom',
    'zip',
  ],
  typeImportsList: [
    { name: 'InitializedObservable', params: ['A'] },
    { name: 'Observable', params: ['A'] },
    { name: 'Subscription', params: [] },
  ],
});
