import { type StrictOmit } from 'ts-type-forge';
import { type ESLintPlugin } from '../../types/index.mjs';
import { reactCodingStyleRules } from './rules/index.mjs';

export const eslintPluginReactCodingStyle: StrictOmit<ESLintPlugin, 'configs'> =
  {
    rules: reactCodingStyleRules,
  } as const;
