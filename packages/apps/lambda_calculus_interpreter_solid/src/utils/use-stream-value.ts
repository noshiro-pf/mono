import {
  InitializedObservable,
  Observable,
  source,
  withInitialValue,
} from '@noshiro/syncflow';
import { Option } from '@noshiro/ts-utils';
import { createSignal, onCleanup } from 'solid-js';

export function useStreamValue<A, B = A>(
  stream$: Observable<A>,
  initialValue: B
): A | B;
export function useStreamValue<A>(stream$: InitializedObservable<A>): A;
export function useStreamValue<A>(stream$: Observable<A>): A | undefined;
export function useStreamValue<A, B = A>(
  stream$: Observable<A>,
  initialValue?: B
): () => A | B | undefined {
  const [getValue, setValue] = createSignal<A | B | undefined>(
    Option.unwrap(stream$.currentValue) ?? initialValue
  );

  const subscription = stream$.subscribe(setValue);
  onCleanup(() => {
    subscription.unsubscribe();
  });

  return getValue;
}

export const useStateAsStream = <A>(
  initialValue: A
): [InitializedObservable<A>, (v: A) => void] => {
  const src$ = source<A>();
  const state$ = src$.chain(withInitialValue(initialValue));

  const setter = (v: A): void => {
    src$.next(v);
  };

  return [state$, setter];
};
