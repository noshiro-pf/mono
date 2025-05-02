import { generateAllGlobalDefs } from '@noshiro/mono-utils';
import 'zx/globals';
import packageJson from '../package.json' with { type: 'json' };

await generateAllGlobalDefs({
  rootDir: path.resolve(import.meta.dirname, '../'),
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
