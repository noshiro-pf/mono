const SomeTypeSymbol: unique symbol = Symbol('Maybe.some');
const NoneTypeSymbol: unique symbol = Symbol('Maybe.none');

type _Some<S> = Readonly<{
  type: typeof SomeTypeSymbol;
  value: S;
}>;

type _None = Readonly<{
  type: typeof NoneTypeSymbol;
}>;

export type Maybe<S> = _None | _Some<S>;

export namespace Maybe {
  export type Some<S> = _Some<S>;
  export type None = _None;

  export type Base = Maybe<unknown>;

  export type Unwrap<M extends Base> = M extends Some<infer S> ? S : never;

  export type NarrowToSome<M extends Base> = M extends None ? never : M;

  export type NarrowToNone<M extends Base> =
    M extends Some<unknown> ? never : M;

  export const some = <S,>(value: S): Some<S> => ({
    type: SomeTypeSymbol,
    value,
  });

  export const none: None = { type: NoneTypeSymbol } as const;

  export const isSome = <M extends Base>(maybe: M): maybe is NarrowToSome<M> =>
    maybe.type === SomeTypeSymbol;

  export const isNone = <M extends Base>(maybe: M): maybe is NarrowToNone<M> =>
    maybe.type === NoneTypeSymbol;

  export const map = <M extends Base, S2>(
    maybe: M,
    mapFn: (value: Unwrap<M>) => S2,
  ): Maybe<S2> =>
    isNone(maybe)
      ? none
      : some(
          mapFn(
            // eslint-disable-next-line total-functions/no-unsafe-type-assertion
            (maybe as NarrowToSome<M>).value as Unwrap<M>,
          ),
        );

  export const unwrapThrow = <M extends Base>(maybe: M): Unwrap<M> => {
    if (isNone(maybe)) {
      throw new Error('`unwrapThrow()` has failed because it is `None`');
    }

    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    return (maybe as NarrowToSome<M>).value as Unwrap<M>;
  };

  export const unwrap = <M extends Base>(maybe: M): Unwrap<M> | undefined =>
    isNone(maybe)
      ? undefined
      : // eslint-disable-next-line total-functions/no-unsafe-type-assertion
        ((maybe as NarrowToSome<M>).value as Unwrap<M>);

  export const unwrapOr = <M extends Base, D>(
    maybe: M,
    defaultValue: D,
  ): D | Unwrap<M> =>
    isNone(maybe)
      ? defaultValue
      : // eslint-disable-next-line total-functions/no-unsafe-type-assertion
        ((maybe as NarrowToSome<M>).value as Unwrap<M>);

  export const expectToBe =
    <M extends Base>(message: string) =>
    (maybe: M): Unwrap<M> => {
      if (isNone(maybe)) {
        throw new Error(message);
      }
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      return (maybe as NarrowToSome<M>).value as Unwrap<M>;
    };
}
