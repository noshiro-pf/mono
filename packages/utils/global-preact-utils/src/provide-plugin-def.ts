import { Obj, tp } from '@noshiro/ts-utils';

export const providePluginPreactUtilsDef = Obj.fromEntries(
  [
    'memoNamed',
    'useAlive',
    'useBoolState',
    'usePromiseValue',
    'useState',
    'useTinyObservable',
    'useTinyObservableEffect',
    'useTinyObservableValue',
  ].map((key) => tp(key, tp('@noshiro/preact-utils', key)))
);
