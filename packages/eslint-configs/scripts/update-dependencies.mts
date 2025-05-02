/* eslint-disable @typescript-eslint/no-unused-expressions */
import { castMutable, isRecord } from '@noshiro/mono-utils';
import 'zx/globals';
import { generateRulesType } from './generate-rules-type.mjs';

const thisDir = import.meta.dirname;
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

const getEslintPluginNames = async (
  packageJsonPath: string | undefined,
): Promise<readonly string[]> => {
  if (packageJsonPath === undefined) return [];

  const content = await fs.readFile(packageJsonPath, { encoding: 'utf8' });

  const parsed = JSON.parse(content) ?? {};

  if (!isRecord(parsed)) return [];

  if (!Object.hasOwn(parsed, 'dependencies')) return [];

  const mut_targetPath = castMutable(parsed.dependencies);

  if (!isRecord(mut_targetPath)) return [];

  return Object.keys(mut_targetPath)
    .map((key) => mut_targetPath[key])
    .filter(
      (s): s is string =>
        typeof s === 'string' &&
        (s.startsWith('eslint-plugin-') || s.startsWith('@typescript-eslint')),
    );
};

const main = async (): Promise<void> => {
  cd(eslintDir);
  {
    echo`${eslintDir}: updating dependencies`;

    const pluginNames = await getEslintPluginNames(`${eslintDir}/package.json`);

    const packages: readonly string[] = [
      ...pluginNames,
      'eslint-import-resolver-typescript',
      '@types/eslint',
      'globals',
      'eslint-plugin-playwright',
      'typescript-eslint',
      'eslint',
    ] as const;

    await $`yarn add ${packages.map((a) => `${a}@latest`)}`;

    await rewritePackageVersion(`${eslintDir}/package.json`, 'dependencies');

    await $`yarn add -D json-schema-to-typescript@latest`;
  }

  cd(monoRootDir);

  echo`yarn install`;
  await $`yarn install`;

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

  await $`yarn install`;

  await $`yarn fmt:diff`;
};

main().catch(console.error);
