type MakeTuple<
  Elm,
  N extends number,
> = TSTypeUtilsInternals.MakeTupleInternals.MakeTupleImpl<Elm, `${N}`, []>;

/**
 * @link https://techracho.bpsinc.jp/yoshi/2020_09_04/97108
 * @internal
 */
declare namespace TSTypeUtilsInternals {
  namespace MakeTupleInternals {
    type Digit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

    type Tail<T extends string> = T extends `${Digit}${infer U}` ? U : never;

    type First<T extends string> = T extends `${infer U}${Tail<T>}` ? U : never;

    type DigitStr = `${Digit}`;

    type Tile<
      T extends readonly unknown[],
      N extends Digit | DigitStr | '10' | 10,
    > = [
      readonly [],
      readonly [...T],
      readonly [...T, ...T],
      readonly [...T, ...T, ...T],
      readonly [...T, ...T, ...T, ...T],
      readonly [...T, ...T, ...T, ...T, ...T],
      readonly [...T, ...T, ...T, ...T, ...T, ...T],
      readonly [...T, ...T, ...T, ...T, ...T, ...T, ...T],
      readonly [...T, ...T, ...T, ...T, ...T, ...T, ...T, ...T],
      readonly [...T, ...T, ...T, ...T, ...T, ...T, ...T, ...T, ...T],
      readonly [...T, ...T, ...T, ...T, ...T, ...T, ...T, ...T, ...T, ...T],
    ][N];

    type MakeTupleImpl<
      Elm,
      N extends string,
      X extends readonly unknown[],
    > = string extends N
      ? never
      : N extends ''
        ? X
        : First<N> extends infer U
          ? U extends DigitStr
            ? MakeTupleImpl<
                Elm,
                Tail<N>,
                readonly [...Tile<[Elm], U>, ...Tile<X, 10>]
              >
            : never
          : never;
  }
}
