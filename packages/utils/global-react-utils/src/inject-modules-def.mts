import { tp } from '@noshiro/ts-utils';

export const injectModulesDef = Object.fromEntries(
  [
    'memoNamed',
    'useAlive',
    'usePromiseValue',
    'useTinyObservable',
    'useTinyObservableEffect',
    'useTinyObservableValue',
  ].map((key) => tp(key, tp('@noshiro/react-utils', key))),
);
