// usage: yarn create:preact-app <new-app-name>

import 'zx/globals';
import { toThisDir } from '../esm/index.mjs';

const thisDir = toThisDir(import.meta.url);
const monoRootDir = path.resolve(thisDir, '../..');

/**
 * @param {{
 *   newPackageName: string | undefined;
 *   parentDirFromMonoRoot: string;
 *   templatePackageName: string;
 *   templateDirName: string;
 * }} arg
 */
export const createNewPackageShared = async ({
  newPackageName,
  templatePackageName,
  parentDirFromMonoRoot,
  templateDirName,
}) => {
  if (newPackageName === undefined) {
    console.error('name is required.');
    process.exit(1);
  }

  const parentDir = `${monoRootDir}/${parentDirFromMonoRoot}`;
  const templateDir = `${parentDir}/${templateDirName}`;

  await $`mkdir -p "${parentDir}/${newPackageName}"`;
  await $`cp -r "${templateDir}/." "${parentDir}/${newPackageName}/"`;

  const newPackageNameKebab = newPackageName.replace('_', '-');

  echo`${newPackageNameKebab}`;

  await $`sed -i "s/${templatePackageName}/${newPackageNameKebab}/" "${parentDir}/${newPackageName}/package.json"`;

  echo`created ${parentDir}/${newPackageName}`;

  echo`don't forget to add "${newPackageName}" to yarn workspaces!`;
};
