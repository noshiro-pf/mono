import { Option, Result } from '@noshiro/ts-utils';
import { SyncChildObservableClass } from '../class';
import {
  MapOptionOperatorObservable,
  MapResultErrOperatorObservable,
  MapResultOkOperatorObservable,
  Observable,
  Operator,
  Token,
  UnwrapOptionOperatorObservable,
  UnwrapResultErrOperatorObservable,
  UnwrapResultOkOperatorObservable,
} from '../types';

export const unwrapOption = <A>(): Operator<Option<A>, A | undefined> => (
  parent: Observable<Option<A>>
) => new UnwrapOptionObservableClass(parent);

export const unwrapResultOk = <S, E>(): Operator<
  Result<S, E>,
  S | undefined
> => (parent: Observable<Result<S, E>>) =>
  new UnwrapResultOkObservableClass(parent);

export const unwrapResultErr = <S, E>(): Operator<
  Result<S, E>,
  E | undefined
> => (parent: Observable<Result<S, E>>) =>
  new UnwrapResultErrObservableClass(parent);

export const mapOption = <A, B>(
  mapFn: (x: A) => B
): Operator<Option<A>, Option<B>> => (parent: Observable<Option<A>>) =>
  new MapOptionObservableClass(parent, mapFn);

export const mapResultOk = <S, S2, E>(
  mapFn: (x: S) => S2
): Operator<Result<S, E>, Result<S2, E>> => (
  parent: Observable<Result<S, E>>
) => new MapResultOkObservableClass(parent, mapFn);

export const mapResultErr = <S, E, E2>(
  mapFn: (x: E) => E2
): Operator<Result<S, E>, Result<S, E2>> => (
  parent: Observable<Result<S, E>>
) => new MapResultErrObservableClass(parent, mapFn);

class UnwrapOptionObservableClass<A>
  extends SyncChildObservableClass<A | undefined, 'unwrapOption', [Option<A>]>
  implements UnwrapOptionOperatorObservable<A> {
  constructor(parent: Observable<Option<A>>) {
    super({
      parents: [parent],
      type: 'unwrapOption',
      currentValueInit: Option.map(Option.unwrap)(parent.currentValue),
    });
  }

  tryUpdate(token: Token): void {
    const parent = this.parents[0];
    if (parent.token !== token) return; // skip update
    if (Option.isNone(parent.currentValue)) return; // skip update

    this.setNext(Option.unwrap(parent.currentValue.value), token);
  }
}

class UnwrapResultOkObservableClass<S, E>
  extends SyncChildObservableClass<
    S | undefined,
    'unwrapResultOk',
    [Result<S, E>]
  >
  implements UnwrapResultOkOperatorObservable<S, E> {
  constructor(parent: Observable<Result<S, E>>) {
    super({
      parents: [parent],
      type: 'unwrapResultOk',
      currentValueInit: Option.map(Result.unwrapOk)(parent.currentValue),
    });
  }

  tryUpdate(token: Token): void {
    const parent = this.parents[0];
    if (parent.token !== token) return; // skip update
    if (Option.isNone(parent.currentValue)) return; // skip update

    this.setNext(Result.unwrapOk(parent.currentValue.value), token);
  }
}

class UnwrapResultErrObservableClass<S, E>
  extends SyncChildObservableClass<
    E | undefined,
    'unwrapResultErr',
    [Result<S, E>]
  >
  implements UnwrapResultErrOperatorObservable<S, E> {
  constructor(parent: Observable<Result<S, E>>) {
    super({
      parents: [parent],
      type: 'unwrapResultErr',
      currentValueInit: Option.map(Result.unwrapErr)(parent.currentValue),
    });
  }

  tryUpdate(token: Token): void {
    const parent = this.parents[0];
    if (parent.token !== token) return; // skip update
    if (Option.isNone(parent.currentValue)) return; // skip update

    this.setNext(Result.unwrapErr(parent.currentValue.value), token);
  }
}

class MapOptionObservableClass<A, B>
  extends SyncChildObservableClass<Option<B>, 'mapOption', [Option<A>]>
  implements MapOptionOperatorObservable<A, B> {
  private readonly _mapFn: (x: A) => B;

  constructor(parent: Observable<Option<A>>, mapFn: (x: A) => B) {
    super({
      parents: [parent],
      type: 'mapOption',
      currentValueInit: Option.map(Option.map(mapFn))(parent.currentValue),
    });
    this._mapFn = mapFn;
  }

  tryUpdate(token: Token): void {
    const parent = this.parents[0];
    if (parent.token !== token) return; // skip update
    if (Option.isNone(parent.currentValue)) return; // skip update

    this.setNext(Option.map(this._mapFn)(parent.currentValue.value), token);
  }
}

class MapResultOkObservableClass<S, S2, E>
  extends SyncChildObservableClass<Result<S2, E>, 'mapResultOk', [Result<S, E>]>
  implements MapResultOkOperatorObservable<S, S2, E> {
  private readonly _mapFn: (x: S) => S2;

  constructor(parent: Observable<Result<S, E>>, mapFn: (x: S) => S2) {
    super({
      parents: [parent],
      type: 'mapResultOk',
      currentValueInit: Option.map(Result.map<S, S2, E>(mapFn))(
        parent.currentValue
      ),
    });
    this._mapFn = mapFn;
  }

  tryUpdate(token: Token): void {
    const parent = this.parents[0];
    if (parent.token !== token) return; // skip update
    if (Option.isNone(parent.currentValue)) return; // skip update

    this.setNext(
      Result.map<S, S2, E>(this._mapFn)(parent.currentValue.value),
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

  constructor(parent: Observable<Result<S, E>>, mapFn: (x: E) => E2) {
    super({
      parents: [parent],
      type: 'mapResultErr',
      currentValueInit: Option.map(Result.mapErr<S, E, E2>(mapFn))(
        parent.currentValue
      ),
    });
    this._mapFn = mapFn;
  }

  tryUpdate(token: Token): void {
    const parent = this.parents[0];
    if (parent.token !== token) return; // skip update
    if (Option.isNone(parent.currentValue)) return; // skip update

    this.setNext(
      Result.mapErr<S, E, E2>(this._mapFn)(parent.currentValue.value),
      token
    );
  }
}
