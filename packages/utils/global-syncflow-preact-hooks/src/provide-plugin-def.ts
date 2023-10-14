import { tp } from '@noshiro/ts-utils';

export const providePluginDef = Object.fromEntries(
  [
    'useEventObservable',
    'useObservable',
    'useObservableEffect',
    'useObservableReducer',
    'useObservableState',
    'useObservableValue',
    'useValueAsObservable',
    'useVoidEventObservable',
  ].map((key) => tp(key, tp('@noshiro/syncflow-preact-hooks', key))),
);
