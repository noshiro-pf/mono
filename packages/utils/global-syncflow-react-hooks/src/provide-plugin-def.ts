import { Obj, tp } from '@noshiro/ts-utils';

export const providePluginSyncflowReactHooksDef = Obj.fromEntries(
  [
    'useEventObservable',
    'useObservable',
    'useObservableEffect',
    'useObservableReducer',
    'useObservableState',
    'useObservableValue',
    'useValueAsObservable',
    'useVoidEventObservable',
  ].map((key) => tp(key, ['@noshiro/syncflow-react-hooks', key]))
);
