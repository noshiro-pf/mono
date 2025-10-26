import { defineKnownRules, type FlatConfig } from '../types/index.mjs';
import { eslintConfigForReactBase } from './react-base.mjs';

export const eslintConfigForPreact = (
  files?: readonly string[],
): readonly FlatConfig[] => [
  ...eslintConfigForReactBase(files),
  {
    ...(files === undefined ? {} : { files }),
    settings: {
      react: {
        pragma: 'h',
        version: 'detect',
      },
    },
    rules: defineKnownRules({
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'preact/compat',
              importNames: [
                'memo',
                'useState',
                'useReducer',
                'useMemo',
                'useCallback',
                'useRef',
                'useContext',
                'useEffect',
                'useLayoutEffect',
                'useErrorBoundary',
              ],
              message: 'import hooks from preact/hooks instead.',
            },
          ],
        },
      ],
    }),
  } satisfies FlatConfig,
];
