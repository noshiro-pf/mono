import {
  type memoNamed as VAR_memoNamed,
  type useAlive as VAR_useAlive,
  type useBoolState as VAR_useBoolState,
  type usePromiseValue as VAR_usePromiseValue,
  type useState as VAR_useState,
  type useTinyObservable as VAR_useTinyObservable,
  type useTinyObservableEffect as VAR_useTinyObservableEffect,
  type useTinyObservableValue as VAR_useTinyObservableValue,
} from '@noshiro/react-utils';

declare global {
  /* custom types */

  const memoNamed: typeof VAR_memoNamed;
  const useAlive: typeof VAR_useAlive;
  const useBoolState: typeof VAR_useBoolState;
  const usePromiseValue: typeof VAR_usePromiseValue;
  const useState: typeof VAR_useState;
  const useTinyObservable: typeof VAR_useTinyObservable;
  const useTinyObservableEffect: typeof VAR_useTinyObservableEffect;
  const useTinyObservableValue: typeof VAR_useTinyObservableValue;

  /* custom variables */
}
