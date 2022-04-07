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

const packageName = 'preact/hooks';
const varName = 'Preact';

const importsList = ['useCallback', 'useEffect', 'useMemo', 'useReducer'];

const typeImportsList = [
  { name: 'Reducer', params: ['S', 'A'] },
  { name: 'CSSProperties', params: [] },
];

const main = async () => {
  const rootDir = join(__dirname, '../');

  await Promise.all([
    writeFileAsync(
      `${rootDir}/src/globals-decl.ts`,
      [
        "import type { CSSProperties as _CSSProperties } from 'react';",
        generateGlobalsDecl(packageName, importsList, typeImportsList).replace(
          'CSSProperties as _CSSProperties,',
          ''
        ),
      ].join('\n')
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
