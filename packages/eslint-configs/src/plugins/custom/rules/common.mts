import { type ESLintPluginDocs } from '@typescript-eslint/eslint-plugin/use-at-your-own-risk/rules';
import { ESLintUtils } from '@typescript-eslint/utils';

export const createRule = ESLintUtils.RuleCreator<ESLintPluginDocs>(
  () =>
    'https://github.com/noshiro-pf/mono/blob/develop/packages/eslint-configs/src/plugins/custom',
);
