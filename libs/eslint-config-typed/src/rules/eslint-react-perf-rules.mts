import {
  withDefaultOption,
  type EslintReactPerfRules,
} from '../types/index.mjs';

export const eslintReactPerfRules = {
  'react-perf/jsx-no-jsx-as-prop': withDefaultOption('error'),
  'react-perf/jsx-no-new-array-as-prop': withDefaultOption('error'),
  'react-perf/jsx-no-new-function-as-prop': withDefaultOption('error'),
  'react-perf/jsx-no-new-object-as-prop': withDefaultOption('error'),
} as const satisfies EslintReactPerfRules;
