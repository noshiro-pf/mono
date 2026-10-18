#!/usr/bin/env tsx

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr, Result } from 'ts-data-forge';
import { $, glob, isDirectlyExecuted } from 'ts-repo-utils';
import type { NonEmptyArray } from 'ts-type-forge';
import { projectRootPath } from '../project-root-path.mjs';
import {
  applyTransformationsToFile,
  applyTypeTransformations,
} from './apply-codemod.mjs';
import { eslintPlugins } from './constants/eslint-plugins.mjs';
import { tsTypeForgeImportStatement } from './constants/ts-type-forge-import.mjs';
import { generateRulesTypeCore } from './functions/generate-rules-type-core.mjs';

const thisDir = import.meta.dirname;

const TYPES_RULES_DIR = path.resolve(projectRootPath, 'src/types/rules');

const preCodemodLintConfigPath = path.resolve(
  thisDir,
  './oxlint.config.pre-codemod.mts',
);

const postCodemodLintConfigPath = path.resolve(
  thisDir,
  './oxlint.config.post-codemod.mts',
);

const tsconfigPath = path.resolve(thisDir, './tsconfig.gen.json');

/**
 * The lint passes sit on either side of the one codemod pass, because the
 * rules depend on it in opposite directions:
 *
 * - `consistent-indexed-object-style` rewrites index signatures into the
 *   built-in `Record`, which the codemod then turns into `ReadonlyRecord`, so
 *   it runs before;
 * - `prefer-canonical-length-constrained-tuple` rewrites `readonly [T, T]`
 *   into `FixedLengthTuple<2, T>`, which needs the `readonly` the codemod adds
 *   — before it, the rule writes `MutableFixedLengthTuple`, which the codemod
 *   does not convert — so it runs after.
 */
export const generateRulesType = async (
  targetFileNames?: NonEmptyArray<string>,
): Promise<void> => {
  {
    const result = await generate(targetFileNames);

    if (result.type === 'error') {
      console.error(result.error);

      return;
    }
  }

  {
    console.info('running `oxlint --fix` (pre codemod) ...');

    await lintFix(preCodemodLintConfigPath, targetFileNames);

    console.info('running codemod...');

    await applyTypeTransformationsForTargets(targetFileNames);

    // The codemod can introduce ts-type-forge type usages of its own (e.g.
    // `ReadonlyRecord`), so restore the import before organize-imports prunes
    // it.
    await restoreTsTypeForgeImport(targetFileNames);

    await fmt(targetFileNames);
  }

  {
    console.info('running `oxlint --fix` (post codemod) ...');

    await lintFix(postCodemodLintConfigPath, targetFileNames);

    // The ts-type-forge rules introduce usages of its types, so the import has
    // to be restored before organize-imports prunes it for the last time.
    await restoreTsTypeForgeImport(targetFileNames);

    await fmt(targetFileNames);
  }
};

/** 生成ファイルの ts-type-forge の import 文を、全型を含む形に戻す */
const restoreTsTypeForgeImport = async (
  targetFileNames?: NonEmptyArray<string>,
): Promise<void> => {
  const globResult = await glob(`${TYPES_RULES_DIR}/*.mts`);

  if (Result.isErr(globResult)) {
    console.error(globResult.value);

    return;
  }

  const targetFiles = filterTargetFiles(globResult.value, targetFileNames);

  for (const filePath of targetFiles) {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const content = await fs.readFile(filePath, 'utf8');

    if (content.includes(tsTypeForgeImportStatement)) {
      continue;
    }

    const replaced = tsTypeForgeImportPattern.test(content)
      ? content.replace(tsTypeForgeImportPattern, tsTypeForgeImportStatement)
      : content.replace(
          eslintImportPattern,
          (matched) => `${matched}\n${tsTypeForgeImportStatement}`,
        );

    if (replaced !== content) {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      await fs.writeFile(filePath, replaced);
    }
  }
};

/** 既存の ts-type-forge の import 文（prettier により複数行になりうる） */
const tsTypeForgeImportPattern =
  /import[\s\w]*\{[^}]*\}\s*from\s*'ts-type-forge';/u;

/** ts-type-forge の import 文を挿入する位置の目印 */
const eslintImportPattern = /import[\s\w]*\{[^}]*\}\s*from\s*'eslint';/u;

const fmt = async (targetFileNames?: NonEmptyArray<string>): Promise<void> => {
  console.info('formatting code ...');

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
    console.info(`generating ${plugin.outputFileName} ...`);

    try {
      const result = await generateRulesTypeCore(
        plugin.typeName,
        plugin.pluginName,
        plugin.rulePrefix,
      );

      const targetFilePath = path.resolve(
        TYPES_RULES_DIR,
        plugin.outputFileName,
      );

      // eslint-disable-next-line security/detect-non-literal-fs-filename
      await fs.writeFile(targetFilePath, result);
    } catch (error) {
      return { type: 'error', error };
    }
  }

  return { type: 'ok' };
};

/**
 * `oxlint --fix` until nothing is left to fix.
 *
 * One oxlint run applies one round of fixes, where `eslint --fix` repeats
 * them up to ten times, so a fix that only becomes possible after another
 * (a tuple inside a tuple, a blank line next to a rewritten statement) waits
 * for the next run. A run that changes no file ends the loop; the problems it
 * still reports are only warned about, because the formatting that follows
 * has to run either way, or the generated files are left half-formatted.
 */
const lintFix = async (
  configPath: string,
  targetFileNames?: NonEmptyArray<string>,
): Promise<void> => {
  const globResult = await glob(`${TYPES_RULES_DIR}/*.mts`);

  if (Result.isErr(globResult)) {
    console.error(globResult.value);

    return;
  }

  // The barrel is `gen:index`'s, which writes it without blank lines.
  const targetFiles = filterTargetFiles(
    globResult.value,
    targetFileNames,
  ).filter((filePath) => path.basename(filePath) !== 'index.mts');

  if (Arr.isEmpty(targetFiles)) {
    console.warn('No files to lint');

    return;
  }

  const command = [
    'oxlint',
    '--config',
    configPath,
    '--tsconfig',
    tsconfigPath,
    '--fix',
    ...targetFiles,
  ].join(' ');

  for (const _ of Arr.seq(maxLintFixRuns)) {
    const before = await readContents(targetFiles);

    const result = await $(command, { silent: true });

    if (Result.isOk(result)) {
      return;
    }

    const after = await readContents(targetFiles);

    if (Arr.eq(before, after)) {
      console.warn('`oxlint --fix` left problems it cannot fix:');

      console.warn(result.value.stdout);

      return;
    }
  }

  console.warn(
    `\`oxlint --fix\` was still fixing after ${maxLintFixRuns} runs.`,
  );
};

const maxLintFixRuns = 10;

const readContents = (
  filePaths: readonly string[],
): Promise<readonly string[]> =>
  Promise.all(
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    filePaths.map((filePath) => fs.readFile(filePath, 'utf8')),
  );

/** 生成対象として指定されたファイル名だけに絞り込む（未指定なら全件） */
const filterTargetFiles = (
  allFiles: readonly string[],
  targetFileNames: NonEmptyArray<string> | undefined,
): readonly string[] =>
  targetFileNames === undefined
    ? allFiles
    : allFiles.filter((filePath) =>
        targetFileNames.some((name) => filePath.endsWith(name)),
      );

const applyTypeTransformationsForTargets = async (
  targetFileNames?: readonly string[],
): Promise<void> => {
  if (targetFileNames === undefined || Arr.isEmpty(targetFileNames)) {
    await applyTypeTransformations();
  } else {
    for (const fileName of targetFileNames) {
      const filePath = path.resolve(TYPES_RULES_DIR, fileName);

      await applyTransformationsToFile(filePath);
    }
  }
};

if (isDirectlyExecuted(import.meta.url)) {
  const targetFiles = Arr.skip(process.argv, 2);

  if (Arr.isNonEmpty(targetFiles)) {
    console.info(`Generating specific files: ${targetFiles.join(', ')}`);

    await generateRulesType(targetFiles);
  } else {
    console.info('Generating all files...');

    await generateRulesType();
  }
}
