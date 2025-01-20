import { type FlatConfig } from '../types/index.mjs';
import { eslintFlatConfigForReactBase } from './react-base.mjs';

export const eslintFlatConfigForPreact = (
  files?: readonly string[],
): readonly FlatConfig[] => [
  eslintFlatConfigForReactBase(files),
  {
    ...(files === undefined ? {} : { files }),
    settings: {
      react: {
        pragma: 'h',
        version: 'detect',
      },
    },
  } satisfies FlatConfig,
];
