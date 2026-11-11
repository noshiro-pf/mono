import {
  filter,
  map,
  withInitialValue,
  type InitializedObservable,
} from 'synstate';
import { Optional } from 'ts-data-forge';
import { toObservable, type Bindable } from '../constant/index.mjs';
import { mountable, type JSX } from '../jsx/index.mjs';
import { mountSwitch } from './mount-switch.mjs';

/**
 * Mounts `some` while `value` holds a value and `none` while it is empty
 * (SPEC.md 8.3).
 *
 * `some` is called once per change from empty to present, with an observable of
 * the value narrowed to `T`. While the value stays present, new values flow
 * through that observable rather than rebuilding the branch. It is derived from
 * `value`, not written to, so nothing is written during propagation.
 *
 * A constant `Some` holding an observable is read as that observable, because a
 * `Some` is its value at runtime.
 */
// Neither `T` nor the type of `constant` excludes it: TypeScript has no negated
// type to say "not an observable" with, and an approximation such as excluding
// `Some<Observable<unknown>>` would also refuse a generic `Some<V>`, would miss
// a `Some` nested in another, and would not reach a constant built from
// another. Nor does a lint rule check it: a rule would have to follow an
// `Optional.some(observable$)` to the slot it is passed to, for a value that is
// rare in a constant. No test pins what `MatchOptional` then does: it is a limit
// to avoid, not a behavior to keep. The JSDoc above is the guard.
export const MatchOptional = <T,>({
  value,
  some,
  none,
}: Readonly<{
  value: Bindable<Optional<T>>;
  some: (value$: InitializedObservable<T>) => JSX.Element;
  none?: JSX.Element;
}>): JSX.Element =>
  mountable(() =>
    mountSwitch(value, Optional.isSome, (isSome, current) =>
      isSome && Optional.isSome(current)
        ? some(
            toObservable(value)
              .pipe(filter(Optional.isSome))
              .pipe(map((o) => Optional.unwrap(o)))
              .pipe(withInitialValue(Optional.unwrap(current))),
          )
        : none,
    ),
  );
