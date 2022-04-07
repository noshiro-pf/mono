export const eslintNoRestrictedImportsPreactDef = {
  name: 'preact/hooks',
  importNames: [
    'useCallback',
    'useEffect',
    'useMemo',
    'useReducer',
    'Reducer',
    'CSSProperties',
  ],
  message: 'use global variable instead.',
};
