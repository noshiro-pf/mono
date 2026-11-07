import { map, type InitializedObservable } from 'synstate-next';
import { Optional, Result } from 'ts-std-forge';
import { toObservable } from '../bindable.mjs';
import type { Bindable } from '../constant.mjs';
import { ControlDescription, type Description } from '../jsx/index.mjs';
import { mountSwitch } from './switch.mjs';

/**
 * Mounts `some` while `value` holds a value, and `none` (or nothing) while it
 * does not. `some` is called once each time a value appears, with an observable
 * of the inner value that follows it for as long as the branch stays.
 */
export const MatchOptional = <T,>({
  value,
  some,
  none,
}: Readonly<{
  value: Bindable<Optional<T>>;
  some: (inner: InitializedObservable<T>) => Description;
  none?: Description;
}>): Description =>
  new ControlDescription((out) => {
    mountSwitch(
      value,
      Optional.isSome,
      (_isSome, current) =>
        Optional.isSome(current)
          ? some(innerOf(value, current.value, someValueOr))
          : none,
      out,
    );
  });

/**
 * Mounts `ok` with an observable of the value while `value` is `Ok`, and `err`
 * with one of the error while it is `Err`. Each is called once each time
 * `value` turns to its side.
 */
export const MatchResult = <S, E>({
  value,
  ok,
  err,
}: Readonly<{
  value: Bindable<Result<S, E>>;
  ok: (inner: InitializedObservable<S>) => Description;
  err: (error: InitializedObservable<E>) => Description;
}>): Description =>
  new ControlDescription((out) => {
    mountSwitch(
      value,
      Result.isOk,
      (_isOk, current) =>
        Result.isOk(current)
          ? ok(innerOf(value, current.value, okValueOr))
          : err(innerOf(value, current.value, errValueOr)),
      out,
    );
  });

/**
 * The inner value of `value` while it stays on the branch's side, starting from
 * `initial`. When `value` leaves the side, the switch disposes the branch
 * first, in the same update: the effect that switches is queued before any made
 * in the branch, so none of them reads the fallback.
 */
const innerOf = <V, T>(
  value: Bindable<V>,
  initial: T,
  unwrapOr: (outer: V, fallback: T) => T,
): InitializedObservable<T> =>
  toObservable(value).pipe(map((outer) => unwrapOr(outer, initial)));

const someValueOr = <T,>(outer: Optional<T>, fallback: T): T =>
  Optional.unwrapOr(outer, fallback);

const okValueOr = <S, E>(outer: Result<S, E>, fallback: S): S =>
  Result.unwrapOkOr(outer, fallback);

const errValueOr = <S, E>(outer: Result<S, E>, fallback: E): E =>
  Result.unwrapErrOr(outer, fallback);
