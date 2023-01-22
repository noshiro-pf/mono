import { type JSX } from 'preact';
import type {
  Reducer as _Reducer,
  useCallback as _useCallback,
  useEffect as _useEffect,
  useMemo as _useMemo,
  useReducer as _useReducer,
} from 'preact/hooks';

declare global {
  type Reducer<S, A> = _Reducer<S, A>;

  /* custom types */
  type CSSProperties = JSX.CSSProperties;
  type GenericEventHandler<Target extends EventTarget> =
    JSX.GenericEventHandler<Target>;

  const useCallback: typeof _useCallback;
  const useEffect: typeof _useEffect;
  const useMemo: typeof _useMemo;
  const useReducer: typeof _useReducer;

  /* custom variables */
}
