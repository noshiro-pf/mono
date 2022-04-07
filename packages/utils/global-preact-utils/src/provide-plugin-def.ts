import { IRecord, tp } from '@noshiro/ts-utils';

export const providePluginPreactUtilsDef = IRecord.fromEntries(
  [
    'memoNamed',
    'useAlive',
    'useBoolState',
    'usePromiseValue',
    'useState',
    'useTinyObservable',
    'useTinyObservableEffect',
    'useTinyObservableValue',
  ].map((key) => tp(key, ['@noshiro/preact-utils', key]))
);
