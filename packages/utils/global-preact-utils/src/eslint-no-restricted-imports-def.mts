export const eslintNoRestrictedImportsDef = {
  name: '@noshiro/preact-utils',
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
