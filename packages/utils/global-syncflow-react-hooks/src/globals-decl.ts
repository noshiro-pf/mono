import type {
  useEventObservable as _useEventObservable,
  useObservable as _useObservable,
  useObservableEffect as _useObservableEffect,
  useObservableReducer as _useObservableReducer,
  useObservableState as _useObservableState,
  useObservableValue as _useObservableValue,
  useValueAsObservable as _useValueAsObservable,
  useVoidEventObservable as _useVoidEventObservable,
} from '@noshiro/syncflow-react-hooks';

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
