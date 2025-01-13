import { execAsync, toThisDir } from '@noshiro/mono-utils';
import * as fs from 'node:fs/promises';
import * as nodePath from 'node:path';
import { eslintPlugins } from './eslint-plugins.mjs';
import { generateRulesType } from './generate-rules-type.mjs';
import { replaceRulesType } from './replace.mjs';

const thisDir = toThisDir(import.meta.url);

const outDir = nodePath.resolve(thisDir, '../src/types/rules');

const prettierrcPath = nodePath.resolve(thisDir, '../../../.prettierrc');

const eslintConfigPath = nodePath.resolve(thisDir, './eslint.config.gen.mjs');

const main = async (): Promise<void> => {
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
      const result = await generateRulesType(
        plugin.typeName,
        plugin.pluginName,
        plugin.rulePrefix,
      );

      const targetFilePath = nodePath.resolve(outDir, plugin.outputFileName);

      // eslint-disable-next-line security/detect-non-literal-fs-filename
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
  const targetFiles = nodePath.resolve(outDir, './*.mts');

  const command = [
    'ESLINT_USE_FLAT_CONFIG=true',
    'yarn eslint',
    '--no-ignore',
    `--config ${eslintConfigPath}`,
    '--fix',
    targetFiles,
  ].join(' ');

  try {
    await execAsync(command);
    return { type: 'ok' };
  } catch (error) {
    return { type: 'error', error };
  }
};

const prettier = async (): Promise<
  Readonly<{ type: 'error'; error: unknown } | { type: 'ok' }>
> => {
  const command = [
    'yarn prettier',
    // '--cache --cache-strategy content',
    `--config ${prettierrcPath}`,
    '--write',
    outDir,
  ].join(' ');

  try {
    await execAsync(command);
    return { type: 'ok' };
  } catch (error) {
    return { type: 'error', error };
  }
};

const runReplace = async (): Promise<
  Readonly<{ type: 'error'; error: unknown } | { type: 'ok' }>
> => {
  for (const plugin of Object.values(eslintPlugins)) {
    try {
      console.log(`modifying ${plugin.outputFileName} ...`);

      const targetFilePath = `${outDir}/${plugin.outputFileName}`;

      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const content = await fs.readFile(targetFilePath, { encoding: 'utf8' });

      const result = replaceRulesType(content, plugin.typeName);

      // eslint-disable-next-line security/detect-non-literal-fs-filename
      await fs.writeFile(targetFilePath, result);
    } catch (error) {
      return { type: 'error', error };
    }
  }

  return { type: 'ok' };
};

main().catch(console.error);
