import { Result } from 'ts-repo-utils';
// eslint-disable-next-line import-x/no-relative-packages
import { genEslintPluginRuleTypes } from '../../../../tools/configs/gen-eslint-plugin-rule-types.mjs';
import { vitestCodingStyleRules } from '../../src/rules/rules.mjs';
import { workspaceRootPath } from '../workspace-root-path.mjs';

const result = await genEslintPluginRuleTypes({
  packageRoot: workspaceRootPath,
  pluginPrefix: 'vitest-coding-style',
  expectTypeFrom: 'ts-data-forge',
  rules: vitestCodingStyleRules,
});

if (Result.isErr(result)) {
  console.error(result.value);

  process.exit(1);
}
