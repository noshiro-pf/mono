import { Arr } from 'ts-data-forge';
import { defineKnownRules, type FlatConfig } from '../types/index.mjs';
import { eslintConfigForReactBase } from './react-base.mjs';

export const eslintConfigForPreact = (
  files?: readonly string[],
): readonly FlatConfig[] =>
  Arr.toPushed(eslintConfigForReactBase(files), {
    ...(files === undefined ? {} : { files }),
    settings: {
      react: {
        pragma: 'h',
        // `version` is intentionally left unset: `'detect'` makes
        // eslint-plugin-react call `context.getFilename()`, which ESLint v10
        // removed, so every version-gated rule throws while loading.
      },
    },
    rules: defineKnownRules({
      'no-restricted-imports': [
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
  });
