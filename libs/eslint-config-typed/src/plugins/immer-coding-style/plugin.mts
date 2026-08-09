import { type StrictOmit } from 'ts-type-forge';
import { type ESLintPlugin } from '../../types/index.mjs';
import { immerCodingStyleRules } from './rules/index.mjs';

export const eslintPluginImmerCodingStyle: StrictOmit<ESLintPlugin, 'configs'> =
  {
    rules: immerCodingStyleRules,
  } as const;
