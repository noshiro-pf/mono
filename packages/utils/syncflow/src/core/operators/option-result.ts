import { Maybe, Result } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class';
import type {
  InitializedToInitializedOperator,
  MapMaybeOperatorObservable,
  MapResultErrOperatorObservable,
  MapResultOkOperatorObservable,
  Observable,
  ToBaseOperator,
  Token,
  UnwrapMaybeOperatorObservable,
  UnwrapResultErrOperatorObservable,
  UnwrapResultOkOperatorObservable,
} from '../types';

export const unwrapMaybe =
  <A>(): ToBaseOperator<Maybe<A>, A | undefined> =>
  (parentObservable: Observable<Maybe<A>>) =>
    new UnwrapMaybeObservableClass(parentObservable);

export const unwrapMaybeI = <A>(): InitializedToInitializedOperator<
  Maybe<A>,
  A | undefined
> => unwrapMaybe() as InitializedToInitializedOperator<Maybe<A>, A | undefined>;

export const unwrapResultOk =
  <S, E>(): ToBaseOperator<Result<S, E>, S | undefined> =>
  (parentObservable: Observable<Result<S, E>>) =>
    new UnwrapResultOkObservableClass(parentObservable);

export const unwrapResultOkI = <S, E>(): InitializedToInitializedOperator<
  Result<S, E>,
  S | undefined
> =>
  unwrapResultOk() as InitializedToInitializedOperator<
    Result<S, E>,
    S | undefined
  >;

export const unwrapResultErr =
  <S, E>(): ToBaseOperator<Result<S, E>, E | undefined> =>
  (parentObservable: Observable<Result<S, E>>) =>
    new UnwrapResultErrObservableClass(parentObservable);

export const unwrapResultErrI = <S, E>(): InitializedToInitializedOperator<
  Result<S, E>,
  E | undefined
> =>
  unwrapResultErr() as InitializedToInitializedOperator<
    Result<S, E>,
    E | undefined
  >;

export const mapMaybe =
  <A, B>(mapFn: (x: A) => B): ToBaseOperator<Maybe<A>, Maybe<B>> =>
  (parentObservable: Observable<Maybe<A>>) =>
    new MapMaybeObservableClass(parentObservable, mapFn);

export const mapMaybeI = <A, B>(
  mapFn: (x: A) => B
): InitializedToInitializedOperator<Maybe<A>, Maybe<B>> =>
  mapMaybe(mapFn) as InitializedToInitializedOperator<Maybe<A>, Maybe<B>>;

export const mapResultOk =
  <S, S2, E>(
    mapFn: (x: S) => S2
  ): ToBaseOperator<Result<S, E>, Result<S2, E>> =>
  (parentObservable: Observable<Result<S, E>>) =>
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

class UnwrapMaybeObservableClass<A>
  extends SyncChildObservableClass<
    A | undefined,
    'unwrapMaybe',
    readonly [Maybe<A>]
  >
  implements UnwrapMaybeOperatorObservable<A>
{
  constructor(parentObservable: Observable<Maybe<A>>) {
    super({
      parents: [parentObservable],
      type: 'unwrapMaybe',
      currentValueInit: Maybe.map(Maybe.unwrap)(parentObservable.currentValue),
    });
  }

  override tryUpdate(token: Token): void {
    const par = this.parents[0];
    if (par.token !== token) return; // skip update
    if (Maybe.isNone(par.currentValue)) return; // skip update

    this.setNext(Maybe.unwrap(par.currentValue.value), token);
  }
}

class UnwrapResultOkObservableClass<S, E>
  extends SyncChildObservableClass<
    S | undefined,
    'unwrapResultOk',
    readonly [Result<S, E>]
  >
  implements UnwrapResultOkOperatorObservable<S, E>
{
  constructor(parentObservable: Observable<Result<S, E>>) {
    super({
      parents: [parentObservable],
      type: 'unwrapResultOk',
      currentValueInit: Maybe.map(Result.unwrapOk)(
        parentObservable.currentValue
      ),
    });
  }

  override tryUpdate(token: Token): void {
    const par = this.parents[0];
    if (par.token !== token) return; // skip update
    if (Maybe.isNone(par.currentValue)) return; // skip update

    this.setNext(Result.unwrapOk(par.currentValue.value), token);
  }
}

class UnwrapResultErrObservableClass<S, E>
  extends SyncChildObservableClass<
    E | undefined,
    'unwrapResultErr',
    readonly [Result<S, E>]
  >
  implements UnwrapResultErrOperatorObservable<S, E>
{
  constructor(parentObservable: Observable<Result<S, E>>) {
    super({
      parents: [parentObservable],
      type: 'unwrapResultErr',
      currentValueInit: Maybe.map(Result.unwrapErr)(
        parentObservable.currentValue
      ),
    });
  }

  override tryUpdate(token: Token): void {
    const par = this.parents[0];
    if (par.token !== token) return; // skip update
    if (Maybe.isNone(par.currentValue)) return; // skip update

    this.setNext(Result.unwrapErr(par.currentValue.value), token);
  }
}

class MapMaybeObservableClass<A, B>
  extends SyncChildObservableClass<Maybe<B>, 'mapMaybe', readonly [Maybe<A>]>
  implements MapMaybeOperatorObservable<A, B>
{
  private readonly _mapFn: (x: A) => B;

  constructor(parentObservable: Observable<Maybe<A>>, mapFn: (x: A) => B) {
    super({
      parents: [parentObservable],
      type: 'mapMaybe',
      currentValueInit: Maybe.map(Maybe.map(mapFn))(
        parentObservable.currentValue
      ),
    });
    this._mapFn = mapFn;
  }

  override tryUpdate(token: Token): void {
    const par = this.parents[0];
    if (par.token !== token) return; // skip update
    if (Maybe.isNone(par.currentValue)) return; // skip update

    this.setNext(Maybe.map(this._mapFn)(par.currentValue.value), token);
  }
}

class MapResultOkObservableClass<S, S2, E>
  extends SyncChildObservableClass<
    Result<S2, E>,
    'mapResultOk',
    readonly [Result<S, E>]
  >
  implements MapResultOkOperatorObservable<S, S2, E>
{
  private readonly _mapFn: (x: S) => S2;

  constructor(parentObservable: Observable<Result<S, E>>, mapFn: (x: S) => S2) {
    super({
      parents: [parentObservable],
      type: 'mapResultOk',
      currentValueInit: Maybe.map(Result.map<S, S2, E>(mapFn))(
        parentObservable.currentValue
      ),
    });
    this._mapFn = mapFn;
  }

  override tryUpdate(token: Token): void {
    const par = this.parents[0];
    if (par.token !== token) return; // skip update
    if (Maybe.isNone(par.currentValue)) return; // skip update

    this.setNext(
      Result.map<S, S2, E>(this._mapFn)(par.currentValue.value),
      token
    );
  }
}

class MapResultErrObservableClass<S, E, E2>
  extends SyncChildObservableClass<
    Result<S, E2>,
    'mapResultErr',
    readonly [Result<S, E>]
  >
  implements MapResultErrOperatorObservable<S, E, E2>
{
  private readonly _mapFn: (x: E) => E2;

  constructor(parentObservable: Observable<Result<S, E>>, mapFn: (x: E) => E2) {
    super({
      parents: [parentObservable],
      type: 'mapResultErr',
      currentValueInit: Maybe.map(Result.mapErr<S, E, E2>(mapFn))(
        parentObservable.currentValue
      ),
    });
    this._mapFn = mapFn;
  }

  override tryUpdate(token: Token): void {
    const par = this.parents[0];
    if (par.token !== token) return; // skip update
    if (Maybe.isNone(par.currentValue)) return; // skip update

    this.setNext(
      Result.mapErr<S, E, E2>(this._mapFn)(par.currentValue.value),
      token
    );
  }
}
