import { IRecord, tp } from '@noshiro/ts-utils';

export const providePluginReactDef = IRecord.fromEntries(
  ['useCallback', 'useEffect', 'useMemo', 'useReducer'].map((key) =>
    tp(key, ['react', key])
  )
);
