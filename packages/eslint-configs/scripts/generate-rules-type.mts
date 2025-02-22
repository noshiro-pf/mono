#!/usr/bin/env zx

import { toThisDir } from '@noshiro/mono-utils';
import 'zx/globals';
import { eslintPlugins } from './eslint-plugins.mjs';
import { generateRulesTypeCore } from './generate-rules-type-core.mjs';
import { replaceRulesType } from './replace.mjs';

const thisDir = toThisDir(import.meta.url);

const outDir = path.resolve(thisDir, '../src/types/rules');

const prettierrcPath = path.resolve(thisDir, '../../../.prettierrc');

const eslintConfigPath = path.resolve(thisDir, './eslint.config.gen.mjs');

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
    const result = await prettier();

    if (result.type === 'error') {
      console.error(result.error);
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
    const result = await prettier();

    if (result.type === 'error') {
      console.error(result.error);
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
    const result = await prettier();

    if (result.type === 'error') {
      console.error(result.error);
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

  const result = await $`TIMING=1 eslint ${[
    '--no-ignore',
    '--fix',
    '--config',
    eslintConfigPath,
  ]} ${targetFiles}`;

  if (result.exitCode !== 0) {
    return { type: 'error', error: result.stderr };
  }

  return { type: 'ok' };
};

const prettier = async (): Promise<
  Readonly<{ type: 'error'; error: unknown } | { type: 'ok' }>
> => {
  const result = await $`prettier ${[
    // '--cache --cache-strategy content',
    `--config`,
    prettierrcPath,
    '--write',
    outDir,
  ]}`;

  if (result.exitCode !== 0) {
    return { type: 'error', error: result.stderr };
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
