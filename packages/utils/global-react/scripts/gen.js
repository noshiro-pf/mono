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

const packageName = 'react';
const varName = 'React';

const importsList = [
  'useCallback',
  'useEffect',
  'useMemo',
  'useReducer',
  'useRef',
];

const typeImportsList = [];

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
