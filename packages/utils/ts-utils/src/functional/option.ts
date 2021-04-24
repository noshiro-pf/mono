export namespace Option {
  const SomeTypeSymbol: unique symbol = Symbol('Option.some');
  const NoneTypeSymbol: unique symbol = Symbol('Option.none');

  export type Some<S> = {
    readonly type: typeof SomeTypeSymbol;
    readonly value: S;
  };
  export type None = {
    readonly type: typeof NoneTypeSymbol;
  };

  export type _Option<S> = None | Some<S>;

  export const some = <S>(value: S): Some<S> => ({
    type: SomeTypeSymbol,
    value,
  });

  export const none: None = { type: NoneTypeSymbol } as const;

  export const isSome = <S>(
    result: _Option<S> | null | undefined
  ): result is Some<S> => result?.type === SomeTypeSymbol;

  export const isNone = <S>(
    result: _Option<S> | null | undefined
  ): result is None => result?.type === NoneTypeSymbol;

  export const map = <S, S2>(mapFn: (value: S) => S2) => (
    result: _Option<S>
  ): _Option<S2> => (isNone(result) ? none : some(mapFn(result.value)));

  export const unwrapThrow = <S>(result: _Option<S>): S => {
    if (isNone(result)) {
      throw new Error();
    }
    return result.value;
  };

  export const unwrap = <S>(result: _Option<S>): S | undefined =>
    isNone(result) ? undefined : result.value;

  export const unwrapOr = <S, D>(
    defaultValue: D
  ): ((result: _Option<S>) => D | S) => (result: _Option<S>): D | S =>
    isNone(result) ? defaultValue : result.value;

  export const expect = <S>(message: string) => (result: _Option<S>): S => {
    if (isNone(result)) {
      throw new Error(message);
    }
    return result.value;
  };
}

export type Option<S> = Option._Option<S>;
