import { IRecord, tp } from '@noshiro/ts-utils';

export const providePluginReactUtilsDef = IRecord.fromEntries(
  [
    'memoNamed',
    'useAlive',
    'useBoolState',
    'usePromiseValue',
    'useState',
    'useTinyObservable',
    'useTinyObservableEffect',
    'useTinyObservableValue',
  ].map((key) => tp(key, ['@noshiro/react-utils', key]))
);
