#!/usr/bin/env tsx

import { Result } from 'ts-data-forge';
import 'ts-repo-utils';
import { eslintPlugins } from './constants/eslint-plugins.mjs';
import { generateRulesTypeCore } from './functions/generate-rules-type-core.mjs';
import { replaceRulesType } from './functions/replace-rules-type.mjs';

const thisDir = import.meta.dirname;

const outDir = path.resolve(thisDir, '../../src/types/rules');

const eslintConfigPath = path.resolve(thisDir, './eslint.config.gen.mjs');

const formatCommand = 'pnpm exec prettier --write src/types/rules/*.mts';

export const generateRulesType = async (): Promise<void> => {
  {
    const result = await generate();

    if (result.type === 'error') {
      console.error(result.error);
      return;
    }
  }

  {
    console.log('running `lint --fix` ... (adding "readonly")');
    const result = await lintFix();

    if (result.type === 'error') {
      console.error(result.error);
      return;
    }
  }

  {
    console.log('formatting code ...');
    const result = await $(formatCommand);

    if (Result.isErr(result)) {
      console.error(result.value);
      return;
    }
  }

  {
    console.log('running `lint --fix` ... (sorting unions)');
    const result = await lintFix();

    if (result.type === 'error') {
      console.error(result.error);
      return;
    }
  }

  {
    console.log('formatting code ...');
    const result = await $(formatCommand);

    if (Result.isErr(result)) {
      console.error(result.value);
      return;
    }
  }

  {
    const result = await runReplace();

    if (result.type === 'error') {
      console.error(result.error);
      return;
    }
  }

  {
    console.log('formatting code ...');
    const result = await $(formatCommand);

    if (Result.isErr(result)) {
      console.error(result.value);
    }
  }
};

const generate = async (): Promise<
  Readonly<{ type: 'error'; error: unknown } | { type: 'ok' }>
> => {
  for (const plugin of Object.values(eslintPlugins)) {
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

const lintFix = async (): Promise<
  Readonly<{ type: 'error'; error: unknown } | { type: 'ok' }>
> => {
  const targetFiles: readonly string[] = await glob(`${outDir}/*.mts`);

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

const runReplace = async (): Promise<
  Readonly<{ type: 'error'; error: unknown } | { type: 'ok' }>
> => {
  for (const plugin of Object.values(eslintPlugins)) {
    try {
      console.log(`modifying ${plugin.outputFileName} ...`);

      const targetFilePath = `${outDir}/${plugin.outputFileName}`;

      const content = await fs.readFile(targetFilePath, { encoding: 'utf8' });

      const result = replaceRulesType(content, plugin.typeName);

      await fs.writeFile(targetFilePath, result);
    } catch (error) {
      return { type: 'error', error };
    }
  }

  return { type: 'ok' };
};

if (isDirectlyExecuted(import.meta.url)) {
  await generateRulesType();
}
