import { Arr } from 'ts-data-forge';
import { eslintReactRules } from '../rules/index.mjs';
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
      'react/no-unknown-property': [
        'error',
        {
          ignore: [
            ...eslintReactRules['react/no-unknown-property'][1].ignore,
            // Preact writes a prop to the DOM under the name it is spelled
            // with. On an SVG element it becomes an attribute, and an
            // attribute `tabIndex` is not `tabindex`, so the element cannot
            // take focus.
            'tabindex',
            // Preact takes the DOM's own event names; `onDoubleClick` is
            // React's spelling and listens for an event that never fires.
            'onDblClick',
          ],
        },
      ],
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
