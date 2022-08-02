export const useRangeSliderRatios = ({
  min,
  max,
  range,
}: DeepReadonly<{
  max: number;
  min: number;
  range: { min: number; max: number };
}>): Readonly<{
  toRatio: (x: number) => number | undefined;
  leftRatio: number;
  rightRatio: number;
}> => {
  const toRatio = useCallback(
    (x: number) => (max === min ? undefined : (x - min) / (max - min)),
    [min, max]
  );

  const leftRatio: number = useMemo(
    () => toRatio(range.min) ?? 0,
    [range, toRatio]
  );

  const rightRatio: number = useMemo(
    () => toRatio(range.max) ?? 1,
    [range, toRatio]
  );

  return {
    toRatio,
    leftRatio,
    rightRatio,
  };
};
