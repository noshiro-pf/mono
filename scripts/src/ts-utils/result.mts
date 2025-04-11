const OkTypeSymbol: unique symbol = Symbol('Result.ok');
const ErrTypeSymbol: unique symbol = Symbol('Result.err');

type Ok_<S> = Readonly<{
  type: typeof OkTypeSymbol;
  value: S;
}>;

type Err_<E> = Readonly<{
  type: typeof ErrTypeSymbol;
  value: E;
}>;

export type Result<S, E> = Err_<E> | Ok_<S>;

export namespace Result {
  export type Ok<S> = Ok_<S>;
  export type Err<E> = Err_<E>;

  export type Base = Result<unknown, unknown>;

  export type UnwrapOk<R extends Base> = R extends Ok<infer S> ? S : never;

  export type UnwrapErr<R extends Base> = R extends Err<infer E> ? E : never;

  export type NarrowToOk<R extends Base> = R extends Err<unknown> ? never : R;

  export type NarrowToErr<R extends Base> = R extends Ok<unknown> ? never : R;

  export const ok = <const S,>(value: S): Ok<S> => ({
    type: OkTypeSymbol,
    value,
  });

  export const err = <const E,>(value: E): Err<E> => ({
    type: ErrTypeSymbol,
    value,
  });

  // eslint-disable-next-line no-restricted-syntax
  const toStr_ = String;

  export const isOk = <const R extends Base>(
    result: R,
  ): result is NarrowToOk<R> => result.type === OkTypeSymbol;

  export const isErr = <const R extends Base>(
    result: R,
  ): result is NarrowToErr<R> => result.type === ErrTypeSymbol;

  export const map = <const R extends Base, S2>(
    result: R,
    mapFn: (value: UnwrapOk<R>) => S2,
  ): Result<S2, UnwrapErr<R>> =>
    isErr(result)
      ? // eslint-disable-next-line total-functions/no-unsafe-type-assertion
        (result as Err<UnwrapErr<R>>)
      : ok(
          mapFn(
            // eslint-disable-next-line total-functions/no-unsafe-type-assertion
            result.value as UnwrapOk<R>,
          ),
        );

  export const mapErr = <const R extends Base, E2>(
    result: R,
    mapFn: (error: UnwrapErr<R>) => E2,
  ): Result<UnwrapOk<R>, E2> =>
    isOk(result)
      ? // eslint-disable-next-line total-functions/no-unsafe-type-assertion
        (result as Ok<UnwrapOk<R>>)
      : err(
          mapFn(
            // eslint-disable-next-line total-functions/no-unsafe-type-assertion
            result.value as UnwrapErr<R>,
          ),
        );

  export const fold = <const R extends Base, S2, E2>(
    result: R,
    mapFn: (value: UnwrapOk<R>) => S2,
    mapErrFn: (error: UnwrapErr<R>) => E2,
  ): Result<S2, E2> =>
    isOk(result)
      ? ok(
          mapFn(
            // eslint-disable-next-line total-functions/no-unsafe-type-assertion
            result.value as UnwrapOk<R>,
          ),
        )
      : err(
          mapErrFn(
            // eslint-disable-next-line total-functions/no-unsafe-type-assertion
            result.value as UnwrapErr<R>,
          ),
        );

  export const unwrapThrow = <const R extends Base>(
    result: R,
    toStr: (e: UnwrapErr<R>) => string = toStr_,
  ): UnwrapOk<R> => {
    if (isErr(result)) {
      throw new Error(
        toStr(
          // eslint-disable-next-line total-functions/no-unsafe-type-assertion
          result.value as UnwrapErr<R>,
        ),
      );
    }
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    return result.value as UnwrapOk<R>;
  };

  export const unwrapOk = <const R extends Base>(
    result: R,
  ): UnwrapOk<R> | undefined =>
    isErr(result)
      ? undefined
      : // eslint-disable-next-line total-functions/no-unsafe-type-assertion
        (result.value as UnwrapOk<R>);

  export const unwrapOkOr = <const R extends Base, D>(
    result: R,
    defaultValue: D,
  ): D | UnwrapOk<R> =>
    isErr(result)
      ? defaultValue
      : // eslint-disable-next-line total-functions/no-unsafe-type-assertion
        (result.value as UnwrapOk<R>);

  export const unwrapErr = <const R extends Base>(
    result: R,
  ): UnwrapErr<R> | undefined =>
    isErr(result)
      ? // eslint-disable-next-line total-functions/no-unsafe-type-assertion
        (result.value as UnwrapErr<R>)
      : undefined;

  export const unwrapErrOr = <const R extends Base, D>(
    result: R,
    defaultValue: D,
  ): D | UnwrapErr<R> =>
    isErr(result)
      ? // eslint-disable-next-line total-functions/no-unsafe-type-assertion
        (result.value as UnwrapErr<R>)
      : defaultValue;

  export const expectToBe =
    <const R extends Base>(message: string) =>
    (result: R): UnwrapOk<R> => {
      if (isErr(result)) {
        throw new Error(message);
      }
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      return result.value as UnwrapOk<R>;
    };

  type UnwrapPromise<P extends Promise<unknown>> =
    P extends Promise<infer V> ? V : never;

  export const fromPromise = <const P extends Promise<unknown>>(
    promise: P,
  ): Promise<Result<UnwrapPromise<P>, unknown>> =>
    promise
      .then(
        (v) =>
          // eslint-disable-next-line total-functions/no-unsafe-type-assertion
          ok(v) as Ok<UnwrapPromise<P>>,
      )
      .catch(err);

  export const group = <S, E>(
    resultArray: readonly Result<S, E>[],
  ): Readonly<{
    oks: readonly S[];
    errs: readonly E[];
  }> => ({
    oks: resultArray.filter(isOk).map((a) => a.value),
    errs: resultArray.filter(isErr).map((a) => a.value),
  });
}
