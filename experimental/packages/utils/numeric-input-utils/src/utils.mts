export type NumericTypeProperties<N extends number> = Readonly<{
  min: N;
  max: N;
  digit: number;
  defaultValue: N;
}>;

export const clampAndRoundFn =
  <N extends number>(p: NumericTypeProperties<N>) =>
  (x: number): N =>
    !Number.isFinite(x)
      ? p.defaultValue
      : x < p.min
        ? p.min
        : p.max < x
          ? p.max
          : // eslint-disable-next-line total-functions/no-unsafe-type-assertion, total-functions/no-partial-division
            ((Math.round(x * 10 ** p.digit) / 10 ** p.digit) as N);

export const createNumberType = <N extends number>({
  min,
  max,
  digit,
  defaultValue,
}: NumericTypeProperties<N>): Readonly<{
  step: number;
  encode: (s: N) => string;
  decode: (s: string) => N;
  clampAndRound: (value: number) => N;
}> &
  NumericTypeProperties<N> => {
  const step = 10 ** -digit;

  const clampAndRound = clampAndRoundFn<N>({
    defaultValue,
    digit,
    max,
    min,
  });

  const encode = (s: N): string => s.toString();

  const decode = (s: string): N => clampAndRound(Number(s));

  return {
    min,
    max,
    digit,
    defaultValue,
    step,
    encode,
    decode,
    clampAndRound,
  };
};
