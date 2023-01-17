import { Obj, tp } from '@noshiro/ts-utils';

export const providePluginPreactDef = Obj.fromEntries(
  ['useCallback', 'useEffect', 'useMemo', 'useReducer'].map((key) =>
    tp(key, tp('preact/hooks', key))
  )
);
