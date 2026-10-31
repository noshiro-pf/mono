import {
  filter,
  map,
  withInitialValue,
  type InitializedObservable,
} from 'synstate';
import { Result } from 'ts-data-forge';
import { toObservable, type Bindable } from '../constant/index.mjs';
import { mountable, type JSX } from '../jsx/index.mjs';
import { mountSwitch } from './mount-switch.mjs';

/**
 * Mounts `ok` while `value` is `Ok` and `err` while it is `Err` (SPEC.md 8.3).
 *
 * Each branch is called once per change of tag, with an observable of the value
 * narrowed to `S` or `E`; while the tag stays the same, new values flow through
 * that observable rather than rebuilding the branch. It is derived from
 * `value`, not written to, so nothing is written during propagation.
 */
export const MatchResult = <S, E>({
  value,
  ok,
  err,
}: Readonly<{
  value: Bindable<Result<S, E>>;
  ok: (value$: InitializedObservable<S>) => JSX.Element;
  err: (error$: InitializedObservable<E>) => JSX.Element;
}>): JSX.Element =>
  mountable(() =>
    mountSwitch(value, Result.isOk, (_isOk, current) => {
      const value$ = toObservable(value);

      return Result.isOk(current)
        ? ok(
            value$
              .pipe(filter(Result.isOk))
              .pipe(map((r) => r.value))
              .pipe(withInitialValue(current.value)),
          )
        : err(
            value$
              .pipe(filter(Result.isErr))
              .pipe(map((r) => r.value))
              .pipe(withInitialValue(current.value)),
          );
    }),
  );
