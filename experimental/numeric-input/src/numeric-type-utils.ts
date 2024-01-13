export type NumericTypeProperties<T extends number> = Readonly<{
  min: T;
  max: T;
  digit: number;
  defaultValue: T;
  step?: number;
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
          : ((Math.round(x * 10 ** p.digit) / 10 ** p.digit) as T);
