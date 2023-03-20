export namespace Maybe {
  const SomeTypeSymbol: unique symbol = Symbol('Maybe.some');
  const NoneTypeSymbol: unique symbol = Symbol('Maybe.none');

  /** @internal */
  export type _Some<S> = Readonly<{
    type: typeof SomeTypeSymbol;
    value: S;
  }>;

  /** @internal */
  export type _None = Readonly<{
    type: typeof NoneTypeSymbol;
  }>;

  /** @internal */
  export type _Maybe<S> = _None | _Some<S>;

  export type Base = _Maybe<unknown>;

  export type Unwrap<M extends Base> = M extends _Some<infer S> ? S : never;

  export type NarrowToSome<M extends Base> = M extends _None ? never : M;

  export type NarrowToNone<M extends Base> = M extends _Some<unknown>
    ? never
    : M;

  export const some = <S>(value: S): _Some<S> => ({
    type: SomeTypeSymbol,
    value,
  });

  export const none: _None = { type: NoneTypeSymbol } as const;

  export const isSome = <M extends Base>(maybe: M): maybe is NarrowToSome<M> =>
    maybe.type === SomeTypeSymbol;

  export const isNone = <M extends Base>(maybe: M): maybe is NarrowToNone<M> =>
    maybe.type === NoneTypeSymbol;

  export const map = <M extends Base, S2>(
    maybe: M,
    mapFn: (value: Unwrap<M>) => S2
  ): _Maybe<S2> =>
    isNone(maybe)
      ? none
      : some(mapFn((maybe as NarrowToSome<M>).value as Unwrap<M>));

  export const unwrapThrow = <M extends Base>(maybe: M): Unwrap<M> => {
    if (isNone(maybe)) {
      throw new Error('`unwrapThrow()` has failed because it is `None`');
    }
    return (maybe as NarrowToSome<M>).value as Unwrap<M>;
  };

  export const unwrap = <M extends Base>(maybe: M): Unwrap<M> | undefined =>
    isNone(maybe) ? undefined : ((maybe as NarrowToSome<M>).value as Unwrap<M>);

  export const unwrapOr = <M extends Base, D>(
    maybe: M,
    defaultValue: D
  ): D | Unwrap<M> =>
    isNone(maybe)
      ? defaultValue
      : ((maybe as NarrowToSome<M>).value as Unwrap<M>);

  export const expectToBe =
    <M extends Base>(message: string) =>
    (maybe: M): Unwrap<M> => {
      if (isNone(maybe)) {
        throw new Error(message);
      }
      return (maybe as NarrowToSome<M>).value as Unwrap<M>;
    };
}

export type Maybe<S> = Maybe._Maybe<S>;
export type Some<S> = Maybe._Some<S>;
export type None = Maybe._None;
