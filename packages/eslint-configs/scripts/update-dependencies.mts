/* eslint-disable @typescript-eslint/no-unused-expressions */
import { castMutable, isRecord, toThisDir } from '@noshiro/mono-utils';
import 'zx/globals';
import { generateRulesType } from './generate-rules-type.mjs';

const thisDir = toThisDir(import.meta.url);
const monoRootDir = path.resolve(thisDir, '../../..');

const eslintDir = path.resolve(thisDir, '..');

const strictTsLibSourceDir = path.resolve(
  monoRootDir,
  './packages/strict-ts-lib/source',
);

const rewritePackageVersion = async (
  packageJsonPath: string | undefined,
  targetJsonKey: string,
): Promise<void> => {
  if (packageJsonPath === undefined) return;

  const content = await fs.readFile(packageJsonPath, { encoding: 'utf8' });

  const parsed = JSON.parse(content) ?? {};

  if (!isRecord(parsed)) return;

  if (!Object.hasOwn(parsed, targetJsonKey)) return;

  const mut_targetPath = castMutable(parsed[targetJsonKey]);

  if (!isRecord(mut_targetPath)) return;

  for (const key of Object.keys(mut_targetPath)) {
    const e = mut_targetPath[key];
    if (typeof e !== 'string') continue;
    mut_targetPath[key] = e.replaceAll(/^\^/gu, '');
  }

  await fs.writeFile(packageJsonPath, JSON.stringify(parsed));
};

const main = async (): Promise<void> => {
  cd(eslintDir);
  {
    echo`${eslintDir}: updating dependencies`;

    /** @type {readonly string[]} */
    const packages = [
      '@typescript-eslint/eslint-plugin',
      '@typescript-eslint/parser',
      '@typescript-eslint/utils',
      'eslint-import-resolver-typescript',
      'eslint-plugin-array-func',
      'eslint-plugin-eslint-plugin',
      'eslint-plugin-import',
      'eslint-plugin-jest',
      'eslint-plugin-jsx-a11y',
      'eslint-plugin-prefer-arrow-functions',
      'eslint-plugin-promise',
      'eslint-plugin-react-hooks',
      'eslint-plugin-react-refresh',
      'eslint-plugin-react',
      'eslint-plugin-security',
      'eslint-plugin-strict-dependencies',
      'eslint-plugin-testing-library',
      'eslint-plugin-total-functions',
      'eslint-plugin-tree-shakable',
      'eslint-plugin-unicorn',
      'eslint-plugin-vitest',
      '@types/eslint',
      'globals',
      'eslint-plugin-playwright',
      'typescript-eslint',
      'eslint',
    ];

    await $`yarn add ${packages.map((a) => `${a}@latest`)}`;

    await rewritePackageVersion(`${eslintDir}/package.json`, 'dependencies');

    await $`yarn add -D json-schema-to-typescript@latest`;
  }

  cd(monoRootDir);

  echo`yarn install`;
  await $`yarn`;

  cd(eslintDir);

  echo`${eslintDir}: generating rules type`;
  await generateRulesType();

  cd(strictTsLibSourceDir);
  {
    const packages = [
      '@types/eslint',
      '@typescript-eslint/eslint-plugin',
      '@typescript-eslint/parser',
      'eslint',
    ];

    await $`yarn add -D ${packages.map((a) => `${a}@latest`)}`;

    await rewritePackageVersion(
      `${strictTsLibSourceDir}/package.json`,
      'devDependencies',
    );
  }

  cd(monoRootDir);

  await $`yarn`;

  await $`yarn fmt:diff`;
};

main().catch(console.error);
