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
    'createBooleanState',
    'createReducer',
    'createState',
  ],
  message: 'use global variable instead.',
};
