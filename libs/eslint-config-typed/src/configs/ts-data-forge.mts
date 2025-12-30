import { eslintTsDataForgeRules } from '../rules/index.mjs';
import { defineKnownRules, type FlatConfig } from '../types/index.mjs';

export const eslintConfigForTsDataForge = (
  files?: readonly string[],
): FlatConfig =>
  ({
    ...(files === undefined ? {} : { files }),

    rules: defineKnownRules({ ...eslintTsDataForgeRules }),
  }) as const;
