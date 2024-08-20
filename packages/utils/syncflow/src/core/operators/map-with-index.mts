import {
  Maybe,
  Result,
  SafeUint,
  expectType,
  toSafeUint,
} from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class/index.mjs';
import { source } from '../create/index.mjs';
import {
  type InitializedObservable,
  type KeepInitialValueOperator,
  type MapWithIndexOperatorObservable,
  type Observable,
  type UpdaterSymbol,
} from '../types/index.mjs';
import { setInitialValue } from './set-initial-value.mjs';

export const mapWithIndex = <A, B>(
  mapFn: (x: A, index: SafeUint | -1) => B,
): KeepInitialValueOperator<A, B> =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  ((parentObservable) =>
    new MapWithIndexObservableClass(
      parentObservable,
      mapFn,
    )) as KeepInitialValueOperator<A, B>;

/* Specialized operators */

export const map = <A, B>(mapFn: (x: A) => B): KeepInitialValueOperator<A, B> =>
  mapWithIndex(mapFn);

export const mapTo = <A, B>(value: B): KeepInitialValueOperator<A, B> =>
  map(() => value);

export const pluck = <A, K extends keyof A>(
  key: K,
): KeepInitialValueOperator<A, A[K]> => map((a) => a[key]);

export const getKey = pluck; // alias

export const attachIndex = <A,>(): KeepInitialValueOperator<
  A,
  readonly [SafeUint | -1, A]
> => mapWithIndex((a, i) => [i, a] as const);

export const withIndex = attachIndex; // alias

export const unwrapMaybe = <M extends Maybe.Base>(): KeepInitialValueOperator<
  M,
  Maybe.Unwrap<M> | undefined
> => map(Maybe.unwrap);

export const unwrapResultOk = <
  R extends Result.Base,
>(): KeepInitialValueOperator<R, Result.UnwrapOk<R> | undefined> =>
  map(Result.unwrapOk);

export const unwrapResultErr = <
  R extends Result.Base,
>(): KeepInitialValueOperator<R, Result.UnwrapErr<R> | undefined> =>
  map(Result.unwrapErr);

export const mapMaybe = <M extends Maybe.Base, B>(
  mapFn: (x: Maybe.Unwrap<M>) => B,
): KeepInitialValueOperator<M, Maybe<B>> => map((a) => Maybe.map(a, mapFn));

export const mapResultOk = <R extends Result.Base, S2>(
  mapFn: (x: Result.UnwrapOk<R>) => S2,
): KeepInitialValueOperator<R, Result<S2, Result.UnwrapErr<R>>> =>
  map((a) => Result.map(a, mapFn));

export const mapResultErr = <R extends Result.Base, E2>(
  mapFn: (x: Result.UnwrapErr<R>) => E2,
): KeepInitialValueOperator<R, Result<Result.UnwrapOk<R>, E2>> =>
  map((a) => Result.mapErr(a, mapFn));

/* implementation */

class MapWithIndexObservableClass<A, B>
  extends SyncChildObservableClass<B, readonly [A]>
  implements MapWithIndexOperatorObservable<A, B>
{
  readonly #mapFn: (x: A, index: SafeUint | -1) => B;
  #mut_index: SafeUint | -1;

  constructor(
    parentObservable: Observable<A>,
    mapFn: (x: A, index: SafeUint | -1) => B,
  ) {
    super({
      parents: [parentObservable],
      initialValue: Maybe.map(parentObservable.snapshot, (x) => mapFn(x, -1)),
    });

    this.#mut_index = -1;
    this.#mapFn = mapFn;
  }

  override tryUpdate(updaterSymbol: UpdaterSymbol): void {
    const par = this.parents[0];
    if (par.updaterSymbol !== updaterSymbol || Maybe.isNone(par.snapshot)) {
      return; // skip update
    }

    this.#mut_index =
      this.#mut_index === -1 ? toSafeUint(0) : SafeUint.add(1, this.#mut_index);

    this.setNext(
      this.#mapFn(par.snapshot.value, this.#mut_index),
      updaterSymbol,
    );
  }
}

if (import.meta.vitest !== undefined) {
  test('type test', () => {
    expect(1).toBe(1); // dummy
  });

  {
    const s: Observable<number> = source<number>();
    const _d1 = s.chain(map((x) => x + 1));

    expectType<typeof _d1, Observable<number>>('=');
  }

  {
    const s = source<number>();
    const m: InitializedObservable<number> = s.chain(setInitialValue(0));
    const _d = m.chain(map((x) => x + 1));

    expectType<typeof _d, InitializedObservable<number>>('=');
  }
}
