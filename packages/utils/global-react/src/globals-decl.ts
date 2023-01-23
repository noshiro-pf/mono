import {
  type ChangeEvent as _ChangeEvent,
  type CSSProperties as _CSSProperties,
  type FormEvent as _FormEvent,
  type PropsWithChildren as _PropsWithChildren,
  type ReactNode as _ReactNode,
  type Reducer as _Reducer,
  type RefObject as _RefObject,
  type useCallback as _useCallback,
  type useEffect as _useEffect,
  type useMemo as _useMemo,
  type useReducer as _useReducer,
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
