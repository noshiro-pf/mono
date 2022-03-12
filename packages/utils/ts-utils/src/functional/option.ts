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
    option: _Option<S> | null | undefined
  ): option is Some<S> => option?.type === SomeTypeSymbol;

  export const isNone = <S>(
    option: _Option<S> | null | undefined
  ): option is None => option?.type === NoneTypeSymbol;

  export const map =
    <S, S2>(mapFn: (value: S) => S2) =>
    (option: _Option<S>): _Option<S2> =>
      isNone(option) ? none : some(mapFn(option.value));

  export const unwrapThrow = <S>(option: _Option<S>): S => {
    if (isNone(option)) {
      throw new Error();
    }
    return option.value;
  };

  export const unwrap = <S>(option: _Option<S>): S | undefined =>
    isNone(option) ? undefined : option.value;

  export const unwrapOr = <S, D>(option: _Option<S>, defaultValue: D): D | S =>
    isNone(option) ? defaultValue : option.value;

  export const expectToBe =
    <S>(message: string) =>
    (option: _Option<S>): S => {
      if (isNone(option)) {
        throw new Error(message);
      }
      return option.value;
    };
}

export type Option<S> = Option._Option<S>;
