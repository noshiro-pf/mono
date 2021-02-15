export namespace Option {
  const SomeTypeSymbol: unique symbol = Symbol('Option.some');
  const NoneTypeSymbol: unique symbol = Symbol('Option.none');

  export type Some<S> = Readonly<{
    type: typeof SomeTypeSymbol;
    value: S;
  }>;
  export type None = Readonly<{
    type: typeof NoneTypeSymbol;
  }>;

  export type Option<S> = Some<S> | None;

  export const some = <S>(value: S): Some<S> => ({
    type: SomeTypeSymbol,
    value,
  });

  export const none: None = { type: NoneTypeSymbol } as const;

  export const isSome = <S>(
    result: Option<S> | undefined | null
  ): result is Some<S> => result?.type === SomeTypeSymbol;

  export const isNone = <S>(
    result: Option<S> | undefined | null
  ): result is None => result?.type === NoneTypeSymbol;

  export const map = <S, S2>(mapFn: (value: S) => S2) => (
    result: Option<S>
  ): Option<S2> => (isNone(result) ? result : some(mapFn(result.value)));

  export const unwrapThrow = <S>(result: Option<S>): S => {
    if (isNone(result)) {
      throw new Error();
    }
    return result.value;
  };

  export const unwrap = <S>(result: Option<S>): S | undefined =>
    isNone(result) ? undefined : result.value;

  export const unwrapOr = <S, D>(
    defaultValue: D
  ): ((result: Option<S>) => S | D) => (result: Option<S>): S | D =>
    isNone(result) ? defaultValue : result.value;

  export const expect = <S>(message: string) => (result: Option<S>): S => {
    if (isNone(result)) {
      throw new Error(message);
    }
    return result.value;
  };
}

export type Option<S> = Option.Option<S>;
