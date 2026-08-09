import { type StrictOmit } from 'ts-type-forge';
import { type ESLintPlugin } from '../../types/index.mjs';
import { vitestCodingStyleRules } from './rules/index.mjs';

export const eslintPluginVitestCodingStyle: StrictOmit<
  ESLintPlugin,
  'configs'
> = {
  rules: vitestCodingStyleRules,
} as const;
