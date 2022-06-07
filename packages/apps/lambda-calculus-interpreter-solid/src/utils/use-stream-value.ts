import type { InitializedObservable, Observable } from '@noshiro/syncflow';
import { source, withInitialValue } from '@noshiro/syncflow';
import { createSignal, onCleanup } from 'solid-js';

export function useObservableValue<A, B = A>(
  observable$: Observable<A>,
  initialValue: B
): A | B;
export function useObservableValue<A>(observable$: InitializedObservable<A>): A;
export function useObservableValue<A>(
  observable$: Observable<A>
): A | undefined;
export function useObservableValue<A, B = A>(
  observable$: Observable<A>,
  initialValue?: B
): () => A | B | undefined {
  const [getValue, setValue] = createSignal<A | B | undefined>(
    Maybe.unwrap(observable$.currentValue) ?? initialValue
  );

  const subscription = observable$.subscribe(setValue);
  onCleanup(() => {
    subscription.unsubscribe();
  });

  return getValue;
}

export const useObservableState = <A>(
  initialValue: A
): [InitializedObservable<A>, (v: A) => void] => {
  const src$ = source<A>();
  const state$ = src$.chain(withInitialValue(initialValue));

  const setter = (v: A): void => {
    src$.next(v);
  };

  return [state$, setter];
};
