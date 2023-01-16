import { Obj, tp } from '@noshiro/ts-utils';

export const providePluginReactUtilsDef = Obj.fromEntries(
  [
    'memoNamed',
    'useAlive',
    'useBoolState',
    'usePromiseValue',
    'useState',
    'useTinyObservable',
    'useTinyObservableEffect',
    'useTinyObservableValue',
  ].map((key) => tp(key, tp('@noshiro/react-utils', key)))
);
