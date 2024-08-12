import { type FlatConfig } from '../types/index.mjs';
import { eslintFlatConfigForReactBase } from './react-base.mjs';

export const eslintFlatConfigForReact = (): readonly FlatConfig[] =>
  [
    eslintFlatConfigForReactBase(),
    {
      settings: {
        react: {
          version: 'detect',
        },
      },
    } satisfies FlatConfig,
  ] as const;
