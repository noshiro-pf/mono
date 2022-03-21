export namespace Result {
  const OkTypeSymbol: unique symbol = Symbol('Result.ok');
  const ErrTypeSymbol: unique symbol = Symbol('Result.err');

  /** @internal */
  export type _Ok<S> = {
    readonly type: typeof OkTypeSymbol;
    readonly value: S;
  };

  /** @internal */
  export type _Err<E> = {
    readonly type: typeof ErrTypeSymbol;
    readonly value: E;
  };

  /** @internal */
  export type _Result<S, E> = _Err<E> | _Ok<S>;

  export const ok = <S>(value: S): _Ok<S> => ({ type: OkTypeSymbol, value });

  export const err = <E>(value: E): _Err<E> => ({ type: ErrTypeSymbol, value });

  export const isOk = <S, E>(
    result: _Result<S, E> | null | undefined
  ): result is _Ok<S> => result?.type === OkTypeSymbol;

  export const isErr = <S, E>(
    result: _Result<S, E> | null | undefined
  ): result is _Err<E> => result?.type === ErrTypeSymbol;

  export const map =
    <S, S2, E>(mapFn: (value: S) => S2) =>
    (result: _Result<S, E>): _Result<S2, E> =>
      isErr<S, E>(result) ? result : ok(mapFn(result.value));

  export const mapErr =
    <S, E, E2>(mapFn: (error: E) => E2) =>
    (result: _Result<S, E>): _Result<S, E2> =>
      isOk<S, E>(result) ? result : err(mapFn(result.value));

  export const fold =
    <S, S2, E, E2>(mapFn: (value: S) => S2, mapErrFn: (error: E) => E2) =>
    (result: _Result<S, E>): _Result<S2, E2> =>
      isOk<S, E>(result)
        ? ok(mapFn(result.value))
        : err(mapErrFn(result.value));

  export const unwrapThrow = <S, E>(result: _Result<S, E>): S => {
    if (isErr<S, E>(result)) {
      throw new Error(JSON.stringify(result.value));
    }

    return result.value;
  };

  export const unwrapOk = <S, E>(result: _Result<S, E>): S | undefined =>
    isErr<S, E>(result) ? undefined : result.value;

  export const unwrapOkOr = <S, E, D>(
    result: _Result<S, E>,
    defaultValue: D
  ): D | S => (isErr<S, E>(result) ? defaultValue : result.value);

  export const unwrapErr = <S, E>(result: _Result<S, E>): E | undefined =>
    isErr<S, E>(result) ? result.value : undefined;

  export const unwrapErrOr = <S, E, D>(
    result: _Result<S, E>,
    defaultValue: D
  ): D | E => (isErr<S, E>(result) ? result.value : defaultValue);

  export const expectToBe =
    <S, E>(message: string) =>
    (result: _Result<S, E>): S => {
      if (isErr<S, E>(result)) {
        throw new Error(message);
      }

      return result.value;
    };

  export const fromPromise = <S, E = unknown>(
    promise: Readonly<Promise<S>>
  ): Promise<_Result<S, E>> =>
    promise.then(ok).catch((error) => err(error as E));
}

export type Result<S, E> = Result._Result<S, E>;
export type Ok<S> = Result._Ok<S>;
export type Err<E> = Result._Err<E>;
