import {
  type useCallback as VAR_useCallback,
  type useEffect as VAR_useEffect,
  type useMemo as VAR_useMemo,
  type useReducer as VAR_useReducer,
  type useRef as VAR_useRef,
} from 'react';

declare global {
  /* custom types */

  const useCallback: typeof VAR_useCallback;
  const useEffect: typeof VAR_useEffect;
  const useMemo: typeof VAR_useMemo;
  const useReducer: typeof VAR_useReducer;
  const useRef: typeof VAR_useRef;

  /* custom variables */
}
