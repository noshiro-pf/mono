export const eslintNoRestrictedImportsDef = {
  name: '@noshiro/preact-utils',
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
