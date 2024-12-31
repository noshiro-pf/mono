export type NumericTypeProperties<T extends number> = Readonly<{
  min: T;
  max: T;
  digit: number;
  defaultValue: T;
}>;

export const clampAndRound =
  <T extends number>(p: NumericTypeProperties<T>) =>
  (x: number): T =>
    !Number.isFinite(x)
      ? p.defaultValue
      : x < p.min
        ? p.min
        : p.max < x
          ? p.max
          : // eslint-disable-next-line total-functions/no-unsafe-type-assertion, total-functions/no-partial-division
            ((Math.round(x * 10 ** p.digit) / 10 ** p.digit) as T);

export const createNumberType = <T extends number>({
  min,
  max,
  digit,
  defaultValue,
}: NumericTypeProperties<T>): Readonly<{
  step: number;
  encode: (s: T) => string;
  decode: (s: string) => T;
}> &
  NumericTypeProperties<T> => {
  const step = 10 ** -digit;

  const clampAndRoundScore = clampAndRound<T>({
    defaultValue,
    digit,
    max,
    min,
  });

  const encode = (s: T): string => s.toString();

  const decode = (s: string): T => clampAndRoundScore(Number(s));

  return {
    min,
    max,
    digit,
    defaultValue,
    step,
    encode,
    decode,
  };
};
