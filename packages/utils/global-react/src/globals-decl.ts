import {
  type useCallback as _useCallback,
  type useEffect as _useEffect,
  type useMemo as _useMemo,
  type useReducer as _useReducer,
  type useRef as _useRef,
} from 'react';

declare global {
  /* custom types */

  const useCallback: typeof _useCallback;
  const useEffect: typeof _useEffect;
  const useMemo: typeof _useMemo;
  const useReducer: typeof _useReducer;
  const useRef: typeof _useRef;

  /* custom variables */
}
