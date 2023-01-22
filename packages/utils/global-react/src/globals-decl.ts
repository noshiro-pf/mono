import type {
  ChangeEvent as _ChangeEvent,
  CSSProperties as _CSSProperties,
  FormEvent as _FormEvent,
  PropsWithChildren as _PropsWithChildren,
  ReactNode as _ReactNode,
  Reducer as _Reducer,
  RefObject as _RefObject,
  useCallback as _useCallback,
  useEffect as _useEffect,
  useMemo as _useMemo,
  useReducer as _useReducer,
} from 'react';

declare global {
  type Reducer<S, A> = _Reducer<S, A>;
  type CSSProperties = _CSSProperties;
  type PropsWithChildren<P> = _PropsWithChildren<P>;
  type ReactNode = _ReactNode;
  type RefObject<T> = _RefObject<T>;
  type ChangeEvent<T> = _ChangeEvent<T>;
  type FormEvent<T> = _FormEvent<T>;

  /* custom types */

  const useCallback: typeof _useCallback;
  const useEffect: typeof _useEffect;
  const useMemo: typeof _useMemo;
  const useReducer: typeof _useReducer;

  /* custom variables */
}
