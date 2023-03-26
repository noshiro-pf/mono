import { Obj, tp } from '@noshiro/ts-utils';

export const providePluginDef = Obj.fromEntries(
  ['useCallback', 'useEffect', 'useMemo', 'useReducer', 'useRef'].map((key) =>
    tp(key, tp('react', key))
  )
);
