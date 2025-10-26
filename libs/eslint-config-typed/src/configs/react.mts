import { type FlatConfig } from '../types/index.mjs';
import { eslintConfigForReactBase } from './react-base.mjs';

export const eslintConfigForReact = (
  files?: readonly string[],
): readonly FlatConfig[] =>
  [
    ...eslintConfigForReactBase(files),
    {
      ...(files === undefined ? {} : { files }),
      settings: {
        react: {
          version: 'detect',
        },
      },
    } satisfies FlatConfig,
  ] as const;
