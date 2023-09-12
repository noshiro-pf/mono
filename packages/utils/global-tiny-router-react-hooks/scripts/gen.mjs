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

const importsList = ['useRouterLinkClick'];

/**
 * @type {Readonly<{ name: string; params: readonly string[]; }>[]}
 */
const typeImportsList = [];

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
