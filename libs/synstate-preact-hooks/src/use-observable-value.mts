import * as PreactCompat from 'preact/compat';
import { type InitializedObservable, type Observable } from 'synstate';
import { Optional } from 'ts-data-forge';

export function useObservableValue<A, B = A>(
  observable$: Observable<A>,
  initialValue: B,
): A | B;

export function useObservableValue<A>(observable$: InitializedObservable<A>): A;

// An `InitializedObservable` is also an `Observable`: nothing at run time tells
// the two one-argument clauses apart, so they only refine the return type
// (#1952).
// @sumi-expect-error functions/no-refinement-overload
export function useObservableValue<A>(
  observable$: Observable<A>,
): A | undefined;

export function useObservableValue<A, B = A>(
  observable$: Observable<A>,
  initialValue?: B,
): A | B | undefined {
  const value = PreactCompat.useSyncExternalStore(
    (onStoreChange: () => void) => {
      const { unsubscribe } = observable$.subscribe(onStoreChange);

      return unsubscribe;
    },
    () => observable$.getSnapshot(),
  );

  return Optional.unwrapOr(value, initialValue);
}
