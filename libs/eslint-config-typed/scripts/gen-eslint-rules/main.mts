#!/usr/bin/env tsx

import { Arr, Result } from 'ts-data-forge';
import 'ts-repo-utils';
import {
  applyTransformationsToFile,
  applyTypeTransformations,
} from './codemod/apply-type-transformations.mjs';
import { eslintPlugins } from './constants/eslint-plugins.mjs';
import { generateRulesTypeCore } from './functions/generate-rules-type-core.mjs';

const thisDir = import.meta.dirname;

export const outDir = path.resolve(thisDir, '../../src/types/rules');

const eslintConfigPath = path.resolve(thisDir, './eslint.config.gen.mts');

export const generateRulesType = async (
  targetFileNames?: NonEmptyArray<string>,
): Promise<void> => {
  {
    const result = await generate(targetFileNames);

    if (result.type === 'error') {
      console.error(result.error);

      return;
    }

    await fmt(targetFileNames);
  }

  {
    console.log('running codemod...');

    await applyTypeTransformationsForTargets(targetFileNames);

    await fmt(targetFileNames);
  }

  {
    console.log('running `lint --fix` ...');

    const result = await lintFix(targetFileNames);

    if (result.type === 'error') {
      console.error(result.error);

      return;
    }

    await fmt(targetFileNames);
  }
};

const fmt = async (targetFileNames?: NonEmptyArray<string>): Promise<void> => {
  console.log('formatting code ...');

  const targetPattern =
    targetFileNames === undefined
      ? 'src/types/rules/*.mts'
      : targetFileNames.map((name) => `src/types/rules/${name}`).join(' ');

  const result = await $(`pnpm exec prettier --write ${targetPattern}`);

  if (Result.isErr(result)) {
    console.error(result.value);
  }
};

const generate = async (
  targetFileNames?: NonEmptyArray<string>,
): Promise<Readonly<{ type: 'error'; error: unknown } | { type: 'ok' }>> => {
  const plugins = Object.values(eslintPlugins);

  const targetPlugins =
    targetFileNames === undefined
      ? plugins
      : plugins.filter((plugin) =>
          targetFileNames.includes(plugin.outputFileName),
        );

  for (const plugin of targetPlugins) {
    console.log(`generating ${plugin.outputFileName} ...`);

    try {
      const result = await generateRulesTypeCore(
        plugin.typeName,
        plugin.pluginName,
        plugin.rulePrefix,
      );

      const targetFilePath = path.resolve(outDir, plugin.outputFileName);

      await fs.writeFile(targetFilePath, result);
    } catch (error) {
      return { type: 'error', error };
    }
  }

  return { type: 'ok' };
};

const lintFix = async (
  targetFileNames?: NonEmptyArray<string>,
): Promise<Readonly<{ type: 'error'; error: unknown } | { type: 'ok' }>> => {
  const globResult = await glob(`${outDir}/*.mts`);

  if (Result.isErr(globResult)) {
    return { type: 'error', error: globResult.value };
  }

  const allFiles: readonly string[] = globResult.value;

  const targetFiles =
    targetFileNames === undefined
      ? allFiles
      : allFiles.filter((filePath) =>
          targetFileNames.some((name) => filePath.endsWith(name)),
        );

  if (targetFiles.length === 0) {
    console.warn('No files to lint');

    return { type: 'ok' };
  }

  const result = await $(
    `TIMING=1 eslint ${[
      '--no-ignore',
      '--fix',
      '--config',
      eslintConfigPath,
    ].join(' ')} ${targetFiles.join(' ')}`,
  );

  if (Result.isErr(result) && result.value.code !== 0) {
    return { type: 'error', error: result.value.stderr };
  }

  return { type: 'ok' };
};

const applyTypeTransformationsForTargets = async (
  targetFileNames?: readonly string[],
): Promise<void> => {
  if (targetFileNames === undefined || targetFileNames.length === 0) {
    await applyTypeTransformations();
  } else {
    for (const fileName of targetFileNames) {
      const filePath = path.resolve(outDir, fileName);

      await applyTransformationsToFile(filePath);
    }
  }
};

if (isDirectlyExecuted(import.meta.url)) {
  const targetFiles = process.argv.slice(2);

  if (Arr.isNonEmpty(targetFiles)) {
    console.log(`Generating specific files: ${targetFiles.join(', ')}`);

    await generateRulesType(targetFiles);
  } else {
    console.log('Generating all files...');

    await generateRulesType();
  }
}
