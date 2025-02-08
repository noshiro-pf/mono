export const eslintNoRestrictedImportsDef = {
  name: '@noshiro/react-utils',
  importNames: [
    'memoNamed',
    'useAlive',
    'usePromiseValue',
    'useTinyObservable',
    'useTinyObservableEffect',
    'useTinyObservableValue',
  ],
  message: 'use global variable instead.',
};
