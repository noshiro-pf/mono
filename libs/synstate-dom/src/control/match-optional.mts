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
 */
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
              .pipe(map((o) => o.value))
              .pipe(withInitialValue(current.value)),
          )
        : none,
    ),
  );
