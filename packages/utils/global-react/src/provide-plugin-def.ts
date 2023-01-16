import { Obj, tp } from '@noshiro/ts-utils';

export const providePluginReactDef = Obj.fromEntries(
  ['useCallback', 'useEffect', 'useMemo', 'useReducer'].map((key) =>
    tp(key, tp('react', key))
  )
);
