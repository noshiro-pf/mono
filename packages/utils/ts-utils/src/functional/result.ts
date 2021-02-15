export namespace Result {
  const OkTypeSymbol: unique symbol = Symbol('Result.ok');
  const ErrTypeSymbol: unique symbol = Symbol('Result.err');

  export type Ok<S> = Readonly<{
    type: typeof OkTypeSymbol;
    value: S;
  }>;
  export type Err<E> = Readonly<{
    type: typeof ErrTypeSymbol;
    value: E;
  }>;

  export type Result<S, E> = Ok<S> | Err<E>;

  export const ok = <S>(value: S): Ok<S> => ({ type: OkTypeSymbol, value });

  export const err = <E>(value: E): Err<E> => ({ type: ErrTypeSymbol, value });

  export const isOk = <S, E>(
    result: Result<S, E> | undefined | null
  ): result is Ok<S> => result?.type === OkTypeSymbol;

  export const isErr = <S, E>(
    result: Result<S, E> | undefined | null
  ): result is Err<E> => result?.type === ErrTypeSymbol;

  export const map = <S, S2, E>(mapFn: (value: S) => S2) => (
    result: Result<S, E>
  ): Result<S2, E> => (isErr(result) ? result : ok(mapFn(result.value)));

  export const mapErr = <S, E, E2>(mapFn: (error: E) => E2) => (
    result: Result<S, E>
  ): Result<S, E2> => (isOk(result) ? result : err(mapFn(result.value)));

  export const unwrapThrow = <S, E>(result: Result<S, E>): S => {
    if (isErr(result)) {
      throw new Error(JSON.stringify(result.value));
    }
    return result.value;
  };

  export const unwrapOk = <S, E>(result: Result<S, E>): S | undefined =>
    isErr(result) ? undefined : result.value;

  export const unwrapOkOr = <S, E, D>(
    defaultValue: D
  ): ((result: Result<S, E>) => S | D) => (result: Result<S, E>): S | D =>
    isErr(result) ? defaultValue : result.value;

  export const unwrapErr = <S, E>(result: Result<S, E>): E | undefined =>
    isErr(result) ? result.value : undefined;

  export const unwrapErrOr = <S, E, D>(
    defaultValue: D
  ): ((result: Result<S, E>) => E | D) => (result: Result<S, E>): E | D =>
    isErr(result) ? result.value : defaultValue;

  export const expect = <S, E>(message: string) => (
    result: Result<S, E>
  ): S => {
    if (isErr(result)) {
      throw new Error(message);
    }
    return result.value;
  };
}

export type Result<S, E> = Result.Result<S, E>;
