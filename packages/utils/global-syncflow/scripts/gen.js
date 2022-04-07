'use strict';
// @ts-check

const { join } = require('path');
const {
  generateGlobalsDecl,
  generateGlobalsForJest,
  generateProvidePluginDef,
  generateEslintNoRestrictedImportsDef,
} = require('../../../../scripts/generate-global-util-src');
const { writeFileAsync } = require('../../../../scripts/write-file-async');

const packageName = '@noshiro/syncflow';
const varName = 'Syncflow';

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
  const rootDir = join(__dirname, '../');

  await Promise.all([
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
      generateProvidePluginDef(packageName, importsList, varName)
    ),
    writeFileAsync(
      `${rootDir}/src/eslint-no-restricted-imports-def.ts`,
      generateEslintNoRestrictedImportsDef(
        packageName,
        importsList,
        typeImportsList,
        varName
      )
    ),
  ]);
};

main();
