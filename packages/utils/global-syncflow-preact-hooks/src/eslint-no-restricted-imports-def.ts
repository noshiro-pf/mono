export const eslintNoRestrictedImportsDef = {
  name: '@noshiro/syncflow-preact-hooks',
  importNames: [
    'useEventObservable',
    'useObservable',
    'useObservableEffect',
    'useObservableReducer',
    'useObservableState',
    'useObservableValue',
    'useValueAsObservable',
    'useVoidEventObservable',
  ],
  message: 'use global variable instead.',
};
