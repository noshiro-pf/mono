import { tp } from '@noshiro/ts-utils';

export const injectModulesDef = Object.fromEntries(
  [
    'useEventObservable',
    'useObservable',
    'useObservableEffect',
    'useObservableReducer',
    'useObservableState',
    'useObservableValue',
    'useValueAsObservable',
    'useVoidEventObservable',
    'createBooleanState',
    'createReducer',
    'createState',
  ].map((key) => tp(key, tp('@noshiro/syncflow-preact-hooks', key))),
);
