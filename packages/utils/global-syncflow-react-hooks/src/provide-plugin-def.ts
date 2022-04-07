import { IRecord, tp } from '@noshiro/ts-utils';

export const providePluginSyncflowReactHooksDef = IRecord.fromEntries(
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
