import type {
  memoNamed as _memoNamed,
  useAlive as _useAlive,
  useBoolState as _useBoolState,
  usePromiseValue as _usePromiseValue,
  useState as _useState,
  useTinyObservable as _useTinyObservable,
  useTinyObservableEffect as _useTinyObservableEffect,
  useTinyObservableValue as _useTinyObservableValue,
} from '@noshiro/preact-utils';

declare global {
  const memoNamed: typeof _memoNamed;
  const useAlive: typeof _useAlive;
  const useBoolState: typeof _useBoolState;
  const usePromiseValue: typeof _usePromiseValue;
  const useState: typeof _useState;
  const useTinyObservable: typeof _useTinyObservable;
  const useTinyObservableEffect: typeof _useTinyObservableEffect;
  const useTinyObservableValue: typeof _useTinyObservableValue;
}
