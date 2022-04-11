export const eslintNoRestrictedImportsReactDef = {
  name: 'react',
  importNames: [
    'useCallback',
    'useEffect',
    'useMemo',
    'useReducer',
    'Reducer',
    'CSSProperties',
    'PropsWithChildren',
    'ReactNode',
    'RefObject',
    'ChangeEvent',
    'FormEvent',
  ],
  message: 'use global variable instead.',
};
