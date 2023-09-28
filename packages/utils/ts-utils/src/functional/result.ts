const OkTypeSymbol: unique symbol = Symbol('Result.ok');
const ErrTypeSymbol: unique symbol = Symbol('Result.err');

type _Ok<S> = Readonly<{
  type: typeof OkTypeSymbol;
  value: S;
}>;

type _Err<E> = Readonly<{
  type: typeof ErrTypeSymbol;
  value: E;
}>;

export type Result<S, E> = _Err<E> | _Ok<S>;

export namespace Result {
  export type Ok<S> = _Ok<S>;
  export type Err<E> = _Err<E>;

  export type Base = Result<unknown, unknown>;

  export type UnwrapOk<R extends Base> = R extends Ok<infer S> ? S : never;

  export type UnwrapErr<R extends Base> = R extends Err<infer E> ? E : never;

  export type NarrowToOk<R extends Base> = R extends Err<unknown> ? never : R;

  export type NarrowToErr<R extends Base> = R extends Ok<unknown> ? never : R;

  export const ok = <S>(value: S): Ok<S> => ({ type: OkTypeSymbol, value });

  export const err = <E>(value: E): Err<E> => ({ type: ErrTypeSymbol, value });

  // eslint-disable-next-line no-restricted-globals
  const _toStr = String;

  export const isOk = <R extends Base>(result: R): result is NarrowToOk<R> =>
    result.type === OkTypeSymbol;

  export const isErr = <R extends Base>(result: R): result is NarrowToErr<R> =>
    result.type === ErrTypeSymbol;

  export const map = <R extends Base, S2>(
    result: R,
    mapFn: (value: UnwrapOk<R>) => S2
  ): Result<S2, UnwrapErr<R>> =>
    isErr(result)
      ? // eslint-disable-next-line no-restricted-syntax
        (result as Err<UnwrapErr<R>>)
      : // eslint-disable-next-line no-restricted-syntax
        ok(mapFn(result.value as UnwrapOk<R>));

  export const mapErr = <R extends Base, E2>(
    result: R,
    mapFn: (error: UnwrapErr<R>) => E2
  ): Result<UnwrapOk<R>, E2> =>
    isOk(result)
      ? // eslint-disable-next-line no-restricted-syntax
        (result as Ok<UnwrapOk<R>>)
      : // eslint-disable-next-line no-restricted-syntax
        err(mapFn(result.value as UnwrapErr<R>));

  export const fold = <R extends Base, S2, E2>(
    result: R,
    mapFn: (value: UnwrapOk<R>) => S2,
    mapErrFn: (error: UnwrapErr<R>) => E2
  ): Result<S2, E2> =>
    isOk(result)
      ? // eslint-disable-next-line no-restricted-syntax
        ok(mapFn(result.value as UnwrapOk<R>))
      : // eslint-disable-next-line no-restricted-syntax
        err(mapErrFn(result.value as UnwrapErr<R>));

  export const unwrapThrow = <R extends Base>(
    result: R,
    toStr: (e: UnwrapErr<R>) => string = _toStr
  ): UnwrapOk<R> => {
    if (isErr(result)) {
      // eslint-disable-next-line no-restricted-syntax
      throw new Error(toStr(result.value as UnwrapErr<R>));
    }
    // eslint-disable-next-line no-restricted-syntax
    return result.value as UnwrapOk<R>;
  };

  export const unwrapOk = <R extends Base>(
    result: R
  ): UnwrapOk<R> | undefined =>
    // eslint-disable-next-line no-restricted-syntax
    isErr(result) ? undefined : (result.value as UnwrapOk<R>);

  export const unwrapOkOr = <R extends Base, D>(
    result: R,
    defaultValue: D
  ): D | UnwrapOk<R> =>
    // eslint-disable-next-line no-restricted-syntax
    isErr(result) ? defaultValue : (result.value as UnwrapOk<R>);

  export const unwrapErr = <R extends Base>(
    result: R
  ): UnwrapErr<R> | undefined =>
    // eslint-disable-next-line no-restricted-syntax
    isErr(result) ? (result.value as UnwrapErr<R>) : undefined;

  export const unwrapErrOr = <R extends Base, D>(
    result: R,
    defaultValue: D
  ): D | UnwrapErr<R> =>
    // eslint-disable-next-line no-restricted-syntax
    isErr(result) ? (result.value as UnwrapErr<R>) : defaultValue;

  export const expectToBe =
    <R extends Base>(message: string) =>
    (result: R): UnwrapOk<R> => {
      if (isErr(result)) {
        throw new Error(message);
      }
      // eslint-disable-next-line no-restricted-syntax
      return result.value as UnwrapOk<R>;
    };

  type UnwrapPromise<P extends Promise<unknown>> = P extends Promise<infer V>
    ? V
    : never;

  export const fromPromise = <P extends Promise<unknown>>(
    promise: P
  ): Promise<Result<UnwrapPromise<P>, unknown>> =>
    // eslint-disable-next-line no-restricted-syntax
    promise.then((v) => ok(v) as Ok<UnwrapPromise<P>>).catch(err);
}
