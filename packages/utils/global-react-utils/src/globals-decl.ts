import {
  type memoNamed as _memoNamed,
  type useAlive as _useAlive,
  type useBoolState as _useBoolState,
  type usePromiseValue as _usePromiseValue,
  type useState as _useState,
  type useTinyObservable as _useTinyObservable,
  type useTinyObservableEffect as _useTinyObservableEffect,
  type useTinyObservableValue as _useTinyObservableValue,
} from '@noshiro/react-utils';

declare global {
  /* custom types */

  const memoNamed: typeof _memoNamed;
  const useAlive: typeof _useAlive;
  const useBoolState: typeof _useBoolState;
  const usePromiseValue: typeof _usePromiseValue;
  const useState: typeof _useState;
  const useTinyObservable: typeof _useTinyObservable;
  const useTinyObservableEffect: typeof _useTinyObservableEffect;
  const useTinyObservableValue: typeof _useTinyObservableValue;

  /* custom variables */
}
