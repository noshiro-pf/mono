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

const packageName = '@noshiro/ts-utils';
const varName = 'TsUtils';

const importsList = [
  'Arr',
  'ArrayUtils',
  'assertNotUndefined',
  'castWritable',
  'createQueue',
  'createTinyObservable',
  'DateUtils',
  'expectType',
  'hasKey',
  'hasKeyValue',
  'idfn',
  'ifThen',
  'IMap',
  'IMapMapped',
  'isBoolean',
  'ISet',
  'ISetMapped',
  'isNonNullObject',
  'isNotBoolean',
  'isNotNull',
  'isNotNumber',
  'isNotString',
  'isNotSymbol',
  'isNotUndefined',
  'isNull',
  'isNumber',
  'isPrimitive',
  'isRecord',
  'isString',
  'isSymbol',
  'isUndefined',
  'Json',
  'mapOptional',
  'mapOptionalC',
  'match',
  'Maybe',
  'memoizeFunction',
  'MutableMap',
  'MutableSet',
  'noop',
  'Num',
  'Obj',
  'pipe',
  'range',
  'RecordUtils',
  'Result',
  'Str',
  'toBoolean',
  'tp',
];

const typeImportsList = [
  { name: 'Err', params: ['E'] },
  { name: 'DateUtils', params: [] },
  { name: 'IMap', params: ['K', 'V'] },
  { name: 'IMapMapped', params: ['K', 'V', 'KM extends RecordKeyType'] },
  { name: 'ISet', params: ['S'] },
  { name: 'ISetMapped', params: ['K', 'KM extends RecordKeyType'] },
  { name: 'Maybe', params: ['S'] },
  { name: 'None', params: [] },
  { name: 'Ok', params: ['S'] },
  { name: 'Queue', params: ['T'] },
  { name: 'Result', params: ['S', 'E'] },
  { name: 'Some', params: ['S'] },
  { name: 'Subscription', params: [] },
  { name: 'TinyObservable', params: ['T'] },
  { name: 'TinyObservableSource', params: ['T'] },
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
