export const eslintNoRestrictedImportsReactDef = {
  name: 'react',
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
