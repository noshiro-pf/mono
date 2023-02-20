export const eslintNoRestrictedImportsPreactDef = {
  name: 'preact/hooks',
  importNames: ['useCallback', 'useEffect', 'useMemo', 'useReducer', 'useRef'],
  message: 'use global variable instead.',
};
