import {
  type createBooleanState as VAR_createBooleanState,
  type createReducer as VAR_createReducer,
  type createState as VAR_createState,
  type useEventObservable as VAR_useEventObservable,
  type useObservable as VAR_useObservable,
  type useObservableEffect as VAR_useObservableEffect,
  type useObservableReducer as VAR_useObservableReducer,
  type useObservableState as VAR_useObservableState,
  type useObservableValue as VAR_useObservableValue,
  type useValueAsObservable as VAR_useValueAsObservable,
  type useVoidEventObservable as VAR_useVoidEventObservable,
} from '@noshiro/syncflow-preact-hooks';

declare global {
  /* custom types */

  const useEventObservable: typeof VAR_useEventObservable;
  const useObservable: typeof VAR_useObservable;
  const useObservableEffect: typeof VAR_useObservableEffect;
  const useObservableReducer: typeof VAR_useObservableReducer;
  const useObservableState: typeof VAR_useObservableState;
  const useObservableValue: typeof VAR_useObservableValue;
  const useValueAsObservable: typeof VAR_useValueAsObservable;
  const useVoidEventObservable: typeof VAR_useVoidEventObservable;
  const createBooleanState: typeof VAR_createBooleanState;
  const createReducer: typeof VAR_createReducer;
  const createState: typeof VAR_createState;

  /* custom variables */
}
