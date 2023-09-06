import { Maybe, Result } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class';
import {
  type InitializedToInitializedOperator,
  type MapMaybeOperatorObservable,
  type MapResultErrOperatorObservable,
  type MapResultOkOperatorObservable,
  type Observable,
  type ToBaseOperator,
  type UnwrapMaybeOperatorObservable,
  type UnwrapResultErrOperatorObservable,
  type UnwrapResultOkOperatorObservable,
  type UpdaterSymbol,
} from '../types';

export const unwrapMaybe =
  <A>(): ToBaseOperator<Maybe<A>, A | undefined> =>
  (parentObservable: Observable<Maybe<A>>) =>
    new UnwrapMaybeObservableClass(parentObservable);

export const unwrapMaybeI = <
  M extends Maybe.Base
>(): InitializedToInitializedOperator<M, Maybe.Unwrap<M> | undefined> =>
  unwrapMaybe() as InitializedToInitializedOperator<
    M,
    Maybe.Unwrap<M> | undefined
  >;

export const unwrapResultOk =
  <R extends Result.Base>(): ToBaseOperator<
    R,
    Result.UnwrapOk<R> | undefined
  > =>
  (parentObservable: Observable<R>) =>
    new UnwrapResultOkObservableClass(parentObservable);

export const unwrapResultOkI = <
  R extends Result.Base
>(): InitializedToInitializedOperator<R, Result.UnwrapOk<R> | undefined> =>
  unwrapResultOk() as InitializedToInitializedOperator<
    R,
    Result.UnwrapOk<R> | undefined
  >;

export const unwrapResultErr =
  <R extends Result.Base>(): ToBaseOperator<
    R,
    Result.UnwrapErr<R> | undefined
  > =>
  (parentObservable: Observable<R>) =>
    new UnwrapResultErrObservableClass(parentObservable);

export const unwrapResultErrI = <
  R extends Result.Base
>(): InitializedToInitializedOperator<R, Result.UnwrapErr<R> | undefined> =>
  unwrapResultErr() as InitializedToInitializedOperator<
    R,
    Result.UnwrapErr<R> | undefined
  >;

export const mapMaybe =
  <A, B>(mapFn: (x: A) => B): ToBaseOperator<Maybe<A>, Maybe<B>> =>
  (parentObservable: Observable<Maybe<A>>) =>
    new MapMaybeObservableClass(parentObservable, mapFn);

export const mapMaybeI = <M extends Maybe.Base, B>(
  mapFn: (x: Maybe.Unwrap<M>) => B
): InitializedToInitializedOperator<M, Maybe<B>> =>
  mapMaybe(mapFn) as InitializedToInitializedOperator<M, Maybe<B>>;

export const mapResultOk =
  <R extends Result.Base, S2>(
    mapFn: (x: Result.UnwrapOk<R>) => S2
  ): ToBaseOperator<R, Result<S2, Result.UnwrapErr<R>>> =>
  (parentObservable: Observable<R>) =>
    new MapResultOkObservableClass(parentObservable, mapFn);

export const mapResultOkI = <S, S2, E>(
  mapFn: (x: S) => S2
): InitializedToInitializedOperator<Result<S, E>, Result<S2, E>> =>
  mapResultOk(mapFn) as InitializedToInitializedOperator<
    Result<S, E>,
    Result<S2, E>
  >;

export const mapResultErr =
  <S, E, E2>(
    mapFn: (x: E) => E2
  ): ToBaseOperator<Result<S, E>, Result<S, E2>> =>
  (parentObservable: Observable<Result<S, E>>) =>
    new MapResultErrObservableClass(parentObservable, mapFn);

export const mapResultErrI = <S, E, E2>(
  mapFn: (x: E) => E2
): InitializedToInitializedOperator<Result<S, E>, Result<S, E2>> =>
  mapResultErr(mapFn) as InitializedToInitializedOperator<
    Result<S, E>,
    Result<S, E2>
  >;

class UnwrapMaybeObservableClass<M extends Maybe.Base>
  extends SyncChildObservableClass<
    Maybe.Unwrap<M> | undefined,
    'unwrapMaybe',
    readonly [M]
  >
  implements UnwrapMaybeOperatorObservable<M>
{
  constructor(parentObservable: Observable<M>) {
    super({
      parents: [parentObservable],
      type: 'unwrapMaybe',
      initialValue: Maybe.map(parentObservable.snapshot, Maybe.unwrap),
    });
  }

  override tryUpdate(updaterSymbol: UpdaterSymbol): void {
    const par = this.parents[0];
    if (par.updaterSymbol !== updaterSymbol || Maybe.isNone(par.snapshot)) {
      return; // skip update
    }

    this.setNext(Maybe.unwrap(par.snapshot.value), updaterSymbol);
  }
}

class UnwrapResultOkObservableClass<R extends Result.Base>
  extends SyncChildObservableClass<
    Result.UnwrapOk<R> | undefined,
    'unwrapResultOk',
    readonly [R]
  >
  implements UnwrapResultOkOperatorObservable<R>
{
  constructor(parentObservable: Observable<R>) {
    super({
      parents: [parentObservable],
      type: 'unwrapResultOk',
      initialValue: Maybe.map(parentObservable.snapshot, Result.unwrapOk),
    });
  }

  override tryUpdate(updaterSymbol: UpdaterSymbol): void {
    const par = this.parents[0];
    if (par.updaterSymbol !== updaterSymbol || Maybe.isNone(par.snapshot)) {
      return; // skip update
    }

    this.setNext(Result.unwrapOk(par.snapshot.value), updaterSymbol);
  }
}

class UnwrapResultErrObservableClass<R extends Result.Base>
  extends SyncChildObservableClass<
    Result.UnwrapErr<R> | undefined,
    'unwrapResultErr',
    readonly [R]
  >
  implements UnwrapResultErrOperatorObservable<R>
{
  constructor(parentObservable: Observable<R>) {
    super({
      parents: [parentObservable],
      type: 'unwrapResultErr',
      initialValue: Maybe.map(parentObservable.snapshot, Result.unwrapErr),
    });
  }

  override tryUpdate(updaterSymbol: UpdaterSymbol): void {
    const par = this.parents[0];
    if (par.updaterSymbol !== updaterSymbol || Maybe.isNone(par.snapshot)) {
      return; // skip update
    }

    this.setNext(Result.unwrapErr(par.snapshot.value), updaterSymbol);
  }
}

class MapMaybeObservableClass<M extends Maybe.Base, B>
  extends SyncChildObservableClass<Maybe<B>, 'mapMaybe', readonly [M]>
  implements MapMaybeOperatorObservable<M, B>
{
  readonly #mapFn: (x: Maybe.Unwrap<M>) => B;

  constructor(
    parentObservable: Observable<M>,
    mapFn: (x: Maybe.Unwrap<M>) => B
  ) {
    super({
      parents: [parentObservable],
      type: 'mapMaybe',
      initialValue: Maybe.map(parentObservable.snapshot, (a) =>
        Maybe.map(a, mapFn)
      ),
    });
    this.#mapFn = mapFn;
  }

  override tryUpdate(updaterSymbol: UpdaterSymbol): void {
    const par = this.parents[0];
    if (par.updaterSymbol !== updaterSymbol || Maybe.isNone(par.snapshot)) {
      return; // skip update
    }

    this.setNext(Maybe.map(par.snapshot.value, this.#mapFn), updaterSymbol);
  }
}

class MapResultOkObservableClass<R extends Result.Base, S2>
  extends SyncChildObservableClass<
    Result<S2, Result.UnwrapErr<R>>,
    'mapResultOk',
    readonly [R]
  >
  implements MapResultOkOperatorObservable<R, S2>
{
  readonly #mapFn: (x: Result.UnwrapOk<R>) => S2;

  constructor(
    parentObservable: Observable<R>,
    mapFn: (x: Result.UnwrapOk<R>) => S2
  ) {
    super({
      parents: [parentObservable],
      type: 'mapResultOk',
      initialValue: Maybe.map(parentObservable.snapshot, (a) =>
        Result.map(a, mapFn)
      ),
    });
    this.#mapFn = mapFn;
  }

  override tryUpdate(updaterSymbol: UpdaterSymbol): void {
    const par = this.parents[0];
    if (par.updaterSymbol !== updaterSymbol || Maybe.isNone(par.snapshot)) {
      return; // skip update
    }

    this.setNext(Result.map(par.snapshot.value, this.#mapFn), updaterSymbol);
  }
}

class MapResultErrObservableClass<R extends Result.Base, E2>
  extends SyncChildObservableClass<
    Result<Result.UnwrapOk<R>, E2>,
    'mapResultErr',
    readonly [R]
  >
  implements MapResultErrOperatorObservable<R, E2>
{
  readonly #mapFn: (x: Result.UnwrapErr<R>) => E2;

  constructor(
    parentObservable: Observable<R>,
    mapFn: (x: Result.UnwrapErr<R>) => E2
  ) {
    super({
      parents: [parentObservable],
      type: 'mapResultErr',
      initialValue: Maybe.map(parentObservable.snapshot, (a) =>
        Result.mapErr(a, mapFn)
      ),
    });
    this.#mapFn = mapFn;
  }

  override tryUpdate(updaterSymbol: UpdaterSymbol): void {
    const par = this.parents[0];
    if (par.updaterSymbol !== updaterSymbol || Maybe.isNone(par.snapshot)) {
      return; // skip update
    }

    this.setNext(Result.mapErr(par.snapshot.value, this.#mapFn), updaterSymbol);
  }
}
