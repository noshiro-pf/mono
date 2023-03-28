/* eslint-disable
  @typescript-eslint/explicit-function-return-type,
  import/extensions,
  import/no-internal-modules
*/

// @ts-check

import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  generateAutoImportDef,
  generateEslintNoRestrictedImportsDef,
  generateGlobalsDecl,
  generateGlobalsForJest,
  generateIndexTs,
  generateProvidePluginDef,
} from '../../../../scripts/generate-global-util-src.mjs';
import { writeFileAsync } from '../../../../scripts/write-file-async.mjs';
import packageJson from '../package.json' assert { type: 'json' };

const thisDir = dirname(fileURLToPath(import.meta.url));

const packageName = packageJson.name.replace(
  /^@noshiro\/global-/u,
  '@noshiro/'
);

const importsList = [
  'auditTime',
  'auditTimeI',
  'combineLatest',
  'combineLatestI',
  'createBooleanState',
  'createEventEmitter',
  'createReducer',
  'createState',
  'createVoidEventEmitter',
  'debounceTime',
  'debounceTimeI',
  'distinctUntilChanged',
  'distinctUntilChangedI',
  'filter',
  'fromPromise',
  'map',
  'mapI',
  'mapMaybe',
  'mapMaybeI',
  'mapResultErr',
  'mapResultErrI',
  'mapResultOk',
  'mapResultOkI',
  'mapTo',
  'mapToI',
  'mapWithIndex',
  'mapWithIndexI',
  'of',
  'pairwise',
  'pluck',
  'pluckI',
  'scan',
  'skip',
  'source',
  'throttleTime',
  'throttleTimeI',
  'unwrapMaybe',
  'unwrapMaybeI',
  'unwrapResultErr',
  'unwrapResultErrI',
  'unwrapResultOk',
  'unwrapResultOkI',
  'withInitialValue',
  'withLatestFrom',
  'withLatestFromI',
  'zip',
  'zipI',
];

const typeImportsList = [
  { name: 'InitializedObservable', params: ['A'] },
  { name: 'Observable', params: ['A'] },
  { name: 'Subscription', params: [] },
];

const main = async () => {
  const rootDir = join(thisDir, '../');

  await Promise.all([
    writeFileAsync(`${rootDir}/src/index.ts`, generateIndexTs),
    writeFileAsync(
      `${rootDir}/src/globals-decl.ts`,
      generateGlobalsDecl(packageName, importsList, typeImportsList)
    ),
    writeFileAsync(
      `${rootDir}/src/globals.ts`,
      generateGlobalsForJest(packageName, importsList)
    ),
    writeFileAsync(
      `${rootDir}/src/provide-plugin-def.ts`,
      generateProvidePluginDef(packageName, importsList)
    ),
    writeFileAsync(
      `${rootDir}/src/auto-import-def.ts`,
      generateAutoImportDef(packageName, importsList)
    ),
    writeFileAsync(
      `${rootDir}/src/eslint-no-restricted-imports-def.ts`,
      generateEslintNoRestrictedImportsDef(
        packageName,
        importsList,
        typeImportsList
      )
    ),
  ]);
};

await main();
