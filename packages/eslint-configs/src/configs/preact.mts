import { type FlatConfig } from '../types/index.mjs';
import { eslintFlatConfigForReactBase } from './react-base.mjs';

export const eslintFlatConfigForPreact = (): readonly FlatConfig[] => [
  eslintFlatConfigForReactBase(),
  {
    settings: {
      react: {
        pragma: 'h',
        version: 'detect',
      },
    },
  } satisfies FlatConfig,
];
