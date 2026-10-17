import { Result } from 'ts-repo-utils';
// eslint-disable-next-line import-x/no-relative-packages
import { genEslintPluginRuleTypes } from '../../../../tools/configs/gen-eslint-plugin-rule-types.mjs';
import { synstateRules } from '../../src/rules/rules.mjs';
import { workspaceRootPath } from '../workspace-root-path.mjs';

const result = await genEslintPluginRuleTypes({
  packageRoot: workspaceRootPath,
  pluginPrefix: 'synstate',
  expectTypeFrom: 'ts-std-forge',
  rules: synstateRules,
});

if (Result.isErr(result)) {
  console.error(result.value);

  process.exit(1);
}
