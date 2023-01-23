import {
  type useEventObservable as _useEventObservable,
  type useObservable as _useObservable,
  type useObservableEffect as _useObservableEffect,
  type useObservableReducer as _useObservableReducer,
  type useObservableState as _useObservableState,
  type useObservableValue as _useObservableValue,
  type useValueAsObservable as _useValueAsObservable,
  type useVoidEventObservable as _useVoidEventObservable,
} from '@noshiro/syncflow-preact-hooks';

declare global {
  /* custom types */

  const useEventObservable: typeof _useEventObservable;
  const useObservable: typeof _useObservable;
  const useObservableEffect: typeof _useObservableEffect;
  const useObservableReducer: typeof _useObservableReducer;
  const useObservableState: typeof _useObservableState;
  const useObservableValue: typeof _useObservableValue;
  const useValueAsObservable: typeof _useValueAsObservable;
  const useVoidEventObservable: typeof _useVoidEventObservable;

  /* custom variables */
}
