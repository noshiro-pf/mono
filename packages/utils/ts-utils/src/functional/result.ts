export namespace Result {
  const OkTypeSymbol: unique symbol = Symbol('Result.ok');
  const ErrTypeSymbol: unique symbol = Symbol('Result.err');

  export type Ok<S> = {
    readonly type: typeof OkTypeSymbol;
    readonly value: S;
  };
  export type Err<E> = {
    readonly type: typeof ErrTypeSymbol;
    readonly value: E;
  };

  export type _Result<S, E> = Err<E> | Ok<S>;

  export const ok = <S>(value: S): Ok<S> => ({ type: OkTypeSymbol, value });

  export const err = <E>(value: E): Err<E> => ({ type: ErrTypeSymbol, value });

  export const isOk = <S, E>(
    result: _Result<S, E> | null | undefined
  ): result is Ok<S> => result?.type === OkTypeSymbol;

  export const isErr = <S, E>(
    result: _Result<S, E> | null | undefined
  ): result is Err<E> => result?.type === ErrTypeSymbol;

  export const map = <S, S2, E>(mapFn: (value: S) => S2) => (
    result: _Result<S, E>
  ): _Result<S2, E> => (isErr<S, E>(result) ? result : ok(mapFn(result.value)));

  export const mapErr = <S, E, E2>(mapFn: (error: E) => E2) => (
    result: _Result<S, E>
  ): _Result<S, E2> => (isOk<S, E>(result) ? result : err(mapFn(result.value)));

  export const unwrapThrow = <S, E>(result: _Result<S, E>): S => {
    if (isErr<S, E>(result)) {
      throw new Error(JSON.stringify(result.value));
    }
    return result.value;
  };

  export const unwrapOk = <S, E>(result: _Result<S, E>): S | undefined =>
    isErr<S, E>(result) ? undefined : result.value;

  export const unwrapOkOr = <S, E, D>(
    defaultValue: D
  ): ((result: _Result<S, E>) => D | S) => (result: _Result<S, E>): D | S =>
    isErr<S, E>(result) ? defaultValue : result.value;

  export const unwrapErr = <S, E>(result: _Result<S, E>): E | undefined =>
    isErr<S, E>(result) ? result.value : undefined;

  export const unwrapErrOr = <S, E, D>(
    defaultValue: D
  ): ((result: _Result<S, E>) => D | E) => (result: _Result<S, E>): D | E =>
    isErr<S, E>(result) ? result.value : defaultValue;

  export const expect = <S, E>(message: string) => (
    result: _Result<S, E>
  ): S => {
    if (isErr<S, E>(result)) {
      throw new Error(message);
    }
    return result.value;
  };

  export const fromPromise = <S, E = unknown>(
    promise: Promise<S>
  ): Promise<_Result<S, E>> => promise.then(ok).catch(err);
}

export type Result<S, E> = Result._Result<S, E>;
