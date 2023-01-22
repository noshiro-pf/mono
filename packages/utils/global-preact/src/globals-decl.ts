import type {
  Reducer as _Reducer,
  useCallback as _useCallback,
  useEffect as _useEffect,
  useMemo as _useMemo,
  useReducer as _useReducer,
} from 'preact/hooks';
import type { CSSProperties as _CSSProperties } from 'react';

declare global {
  type Reducer<S, A> = _Reducer<S, A>;
  type CSSProperties = _CSSProperties;

  /* custom types */

  const useCallback: typeof _useCallback;
  const useEffect: typeof _useEffect;
  const useMemo: typeof _useMemo;
  const useReducer: typeof _useReducer;

  /* custom variables */
}
