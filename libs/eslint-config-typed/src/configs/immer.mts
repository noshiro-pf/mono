import { eslintImmerCodingStyleRules } from '../rules/index.mjs';
import { defineKnownRules, type FlatConfig } from '../types/index.mjs';

export const eslintConfigForImmer = (files?: readonly string[]): FlatConfig =>
  ({
    ...(files === undefined ? {} : { files }),

    rules: defineKnownRules({ ...eslintImmerCodingStyleRules }),
  }) as const;
