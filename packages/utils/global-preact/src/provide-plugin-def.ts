import { IRecord, tp } from '@noshiro/ts-utils';

export const providePluginPreactDef = IRecord.fromEntries(
  ['useCallback', 'useEffect', 'useMemo', 'useReducer'].map((key) =>
    tp(key, ['preact/hooks', key])
  )
);
