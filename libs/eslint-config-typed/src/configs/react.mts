import { type FlatConfig } from '../types/index.mjs';
import { eslintFlatConfigForReactBase } from './react-base.mjs';

export const eslintFlatConfigForReact = (
  files?: readonly string[],
): readonly FlatConfig[] =>
  [
    eslintFlatConfigForReactBase(files),
    {
      ...(files === undefined ? {} : { files }),
      settings: {
        react: {
          version: 'detect',
        },
      },
    } satisfies FlatConfig,
  ] as const;
