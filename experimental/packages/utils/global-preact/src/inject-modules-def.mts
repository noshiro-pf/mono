import { tp } from '@noshiro/ts-utils';

export const injectModulesDef = Object.fromEntries(
  ['useCallback', 'useEffect', 'useMemo', 'useReducer', 'useRef'].map((key) =>
    tp(key, tp('preact/hooks', key)),
  ),
);
