export const eslintNoRestrictedImportsDef = {
  name: '@noshiro/react-utils',
  importNames: [
    'memoNamed',
    'useAlive',
    'useBoolState',
    'usePromiseValue',
    'useState',
    'useTinyObservable',
    'useTinyObservableEffect',
    'useTinyObservableValue',
  ],
  message: 'use global variable instead.',
};
