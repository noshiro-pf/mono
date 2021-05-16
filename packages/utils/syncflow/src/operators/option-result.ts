import { Option, Result } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class';
import type {
  InitializedToInitializedOperator,
  MapOptionOperatorObservable,
  MapResultErrOperatorObservable,
  MapResultOkOperatorObservable,
  Observable,
  ToBaseOperator,
  Token,
  UnwrapOptionOperatorObservable,
  UnwrapResultErrOperatorObservable,
  UnwrapResultOkOperatorObservable,
} from '../types';

export const unwrapOption = <A>(): ToBaseOperator<Option<A>, A | undefined> => (
  parentObservable: Observable<Option<A>>
) => new UnwrapOptionObservableClass(parentObservable);

export const unwrapOptionI = <A>(): InitializedToInitializedOperator<
  Option<A>,
  A | undefined
> =>
  unwrapOption() as InitializedToInitializedOperator<Option<A>, A | undefined>;

export const unwrapResultOk = <S, E>(): ToBaseOperator<
  Result<S, E>,
  S | undefined
> => (parentObservable: Observable<Result<S, E>>) =>
  new UnwrapResultOkObservableClass(parentObservable);

export const unwrapResultOkI = <S, E>(): InitializedToInitializedOperator<
  Result<S, E>,
  S | undefined
> =>
  unwrapResultOk() as InitializedToInitializedOperator<
    Result<S, E>,
    S | undefined
  >;

export const unwrapResultErr = <S, E>(): ToBaseOperator<
  Result<S, E>,
  E | undefined
> => (parentObservable: Observable<Result<S, E>>) =>
  new UnwrapResultErrObservableClass(parentObservable);

export const unwrapResultErrI = <S, E>(): InitializedToInitializedOperator<
  Result<S, E>,
  E | undefined
> =>
  unwrapResultErr() as InitializedToInitializedOperator<
    Result<S, E>,
    E | undefined
  >;

export const mapOption = <A, B>(
  mapFn: (x: A) => B
): ToBaseOperator<Option<A>, Option<B>> => (
  parentObservable: Observable<Option<A>>
) => new MapOptionObservableClass(parentObservable, mapFn);

export const mapOptionI = <A, B>(
  mapFn: (x: A) => B
): InitializedToInitializedOperator<Option<A>, Option<B>> =>
  mapOption(mapFn) as InitializedToInitializedOperator<Option<A>, Option<B>>;

export const mapResultOk = <S, S2, E>(
  mapFn: (x: S) => S2
): ToBaseOperator<Result<S, E>, Result<S2, E>> => (
  parentObservable: Observable<Result<S, E>>
) => new MapResultOkObservableClass(parentObservable, mapFn);

export const mapResultOkI = <S, S2, E>(
  mapFn: (x: S) => S2
): InitializedToInitializedOperator<Result<S, E>, Result<S2, E>> =>
  mapResultOk(mapFn) as InitializedToInitializedOperator<
    Result<S, E>,
    Result<S2, E>
  >;

export const mapResultErr = <S, E, E2>(
  mapFn: (x: E) => E2
): ToBaseOperator<Result<S, E>, Result<S, E2>> => (
  parentObservable: Observable<Result<S, E>>
) => new MapResultErrObservableClass(parentObservable, mapFn);

export const mapResultErrI = <S, E, E2>(
  mapFn: (x: E) => E2
): InitializedToInitializedOperator<Result<S, E>, Result<S, E2>> =>
  mapResultErr(mapFn) as InitializedToInitializedOperator<
    Result<S, E>,
    Result<S, E2>
  >;

class UnwrapOptionObservableClass<A>
  extends SyncChildObservableClass<A | undefined, 'unwrapOption', [Option<A>]>
  implements UnwrapOptionOperatorObservable<A> {
  constructor(parentObservable: Observable<Option<A>>) {
    super({
      parents: [parentObservable],
      type: 'unwrapOption',
      currentValueInit: Option.map(Option.unwrap)(
        parentObservable.currentValue
      ),
    });
  }

  tryUpdate(token: Token): void {
    const par = this.parents[0];
    if (par.token !== token) return; // skip update
    if (Option.isNone(par.currentValue)) return; // skip update

    this.setNext(Option.unwrap(par.currentValue.value), token);
  }
}

class UnwrapResultOkObservableClass<S, E>
  extends SyncChildObservableClass<
    S | undefined,
    'unwrapResultOk',
    [Result<S, E>]
  >
  implements UnwrapResultOkOperatorObservable<S, E> {
  constructor(parentObservable: Observable<Result<S, E>>) {
    super({
      parents: [parentObservable],
      type: 'unwrapResultOk',
      currentValueInit: Option.map(Result.unwrapOk)(
        parentObservable.currentValue
      ),
    });
  }

  tryUpdate(token: Token): void {
    const par = this.parents[0];
    if (par.token !== token) return; // skip update
    if (Option.isNone(par.currentValue)) return; // skip update

    this.setNext(Result.unwrapOk(par.currentValue.value), token);
  }
}

class UnwrapResultErrObservableClass<S, E>
  extends SyncChildObservableClass<
    E | undefined,
    'unwrapResultErr',
    [Result<S, E>]
  >
  implements UnwrapResultErrOperatorObservable<S, E> {
  constructor(parentObservable: Observable<Result<S, E>>) {
    super({
      parents: [parentObservable],
      type: 'unwrapResultErr',
      currentValueInit: Option.map(Result.unwrapErr)(
        parentObservable.currentValue
      ),
    });
  }

  tryUpdate(token: Token): void {
    const par = this.parents[0];
    if (par.token !== token) return; // skip update
    if (Option.isNone(par.currentValue)) return; // skip update

    this.setNext(Result.unwrapErr(par.currentValue.value), token);
  }
}

class MapOptionObservableClass<A, B>
  extends SyncChildObservableClass<Option<B>, 'mapOption', [Option<A>]>
  implements MapOptionOperatorObservable<A, B> {
  private readonly _mapFn: (x: A) => B;

  constructor(parentObservable: Observable<Option<A>>, mapFn: (x: A) => B) {
    super({
      parents: [parentObservable],
      type: 'mapOption',
      currentValueInit: Option.map(Option.map(mapFn))(
        parentObservable.currentValue
      ),
    });
    this._mapFn = mapFn;
  }

  tryUpdate(token: Token): void {
    const par = this.parents[0];
    if (par.token !== token) return; // skip update
    if (Option.isNone(par.currentValue)) return; // skip update

    this.setNext(Option.map(this._mapFn)(par.currentValue.value), token);
  }
}

class MapResultOkObservableClass<S, S2, E>
  extends SyncChildObservableClass<Result<S2, E>, 'mapResultOk', [Result<S, E>]>
  implements MapResultOkOperatorObservable<S, S2, E> {
  private readonly _mapFn: (x: S) => S2;

  constructor(parentObservable: Observable<Result<S, E>>, mapFn: (x: S) => S2) {
    super({
      parents: [parentObservable],
      type: 'mapResultOk',
      currentValueInit: Option.map(Result.map<S, S2, E>(mapFn))(
        parentObservable.currentValue
      ),
    });
    this._mapFn = mapFn;
  }

  tryUpdate(token: Token): void {
    const par = this.parents[0];
    if (par.token !== token) return; // skip update
    if (Option.isNone(par.currentValue)) return; // skip update

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
    [Result<S, E>]
  >
  implements MapResultErrOperatorObservable<S, E, E2> {
  private readonly _mapFn: (x: E) => E2;

  constructor(parentObservable: Observable<Result<S, E>>, mapFn: (x: E) => E2) {
    super({
      parents: [parentObservable],
      type: 'mapResultErr',
      currentValueInit: Option.map(Result.mapErr<S, E, E2>(mapFn))(
        parentObservable.currentValue
      ),
    });
    this._mapFn = mapFn;
  }

  tryUpdate(token: Token): void {
    const par = this.parents[0];
    if (par.token !== token) return; // skip update
    if (Option.isNone(par.currentValue)) return; // skip update

    this.setNext(
      Result.mapErr<S, E, E2>(this._mapFn)(par.currentValue.value),
      token
    );
  }
}
