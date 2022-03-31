export namespace Maybe {
  const SomeTypeSymbol: unique symbol = Symbol('Maybe.some');
  const NoneTypeSymbol: unique symbol = Symbol('Maybe.none');

  export type Some<S> = {
    readonly type: typeof SomeTypeSymbol;
    readonly value: S;
  };
  export type None = {
    readonly type: typeof NoneTypeSymbol;
  };

  export type _Maybe<S> = None | Some<S>;

  export const some = <S>(value: S): Some<S> => ({
    type: SomeTypeSymbol,
    value,
  });

  export const none: None = { type: NoneTypeSymbol } as const;

  export const isSome = <S>(
    option: _Maybe<S> | null | undefined
  ): option is Some<S> => option?.type === SomeTypeSymbol;

  export const isNone = <S>(
    option: _Maybe<S> | null | undefined
  ): option is None => option?.type === NoneTypeSymbol;

  export const map =
    <S, S2>(mapFn: (value: S) => S2) =>
    (option: _Maybe<S>): _Maybe<S2> =>
      isNone(option) ? none : some(mapFn(option.value));

  export const unwrapThrow = <S>(option: _Maybe<S>): S => {
    if (isNone(option)) {
      throw new Error('`unwrapThrow()` has failed because it is `None`');
    }

    return option.value;
  };

  export const unwrap = <S>(option: _Maybe<S>): S | undefined =>
    isNone(option) ? undefined : option.value;

  export const unwrapOr = <S, D>(option: _Maybe<S>, defaultValue: D): D | S =>
    isNone(option) ? defaultValue : option.value;

  export const expectToBe =
    <S>(message: string) =>
    (option: _Maybe<S>): S => {
      if (isNone(option)) {
        throw new Error(message);
      }

      return option.value;
    };
}

export type Maybe<S> = Maybe._Maybe<S>;
