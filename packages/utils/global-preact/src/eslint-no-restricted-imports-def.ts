export const eslintNoRestrictedImportsPreactDef = {
  name: 'preact/hooks',
  importNames: ['useCallback', 'useEffect', 'useMemo', 'useReducer', 'Reducer'],
  message: 'use global variable instead.',
};
