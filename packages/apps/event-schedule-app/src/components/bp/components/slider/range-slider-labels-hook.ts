import { formatPercentage } from './utils';

export const useRangeSliderLabels = ({
  min,
  max,
  toRatio,
  labelFractionDigits,
  customLabelValues,
}: DeepReadonly<{
  max: number;
  min: number;
  toRatio: (x: number) => number | undefined;
  labelFractionDigits?: UintRange<0, 20>;
  customLabelValues?: readonly number[];
}>): Readonly<{
  customLabelValuesWithRatio: DeepReadonly<
    {
      value: number;
      ratio: number;
      cssStyle: CSSProperties;
    }[]
  >;
  minLabel: string;
  maxLabel: string;
}> => {
  const customLabelValuesWithRatio = useMemo(() => {
    if (customLabelValues === undefined) return [];
    const isInRange = Num.isInRange(min, max);
    if (!customLabelValues.every(isInRange)) {
      console.error('all values should be in [min, max].');
      return [];
    }
    return pipe(customLabelValues)
      .chain((list) => Arr.uniq(list))
      .chain((list) =>
        list.map((x) => ({
          value: x,
          ratio: toRatio(x) ?? 0,
          cssStyle: { left: formatPercentage(toRatio(x) ?? 0) },
        }))
      ).value;
  }, [customLabelValues, min, max, toRatio]);

  const toFixed = useMemo(
    () => Num.toFixed(labelFractionDigits),
    [labelFractionDigits]
  );

  const minLabel = useMemo(() => toFixed(min), [min, toFixed]);
  const maxLabel = useMemo(() => toFixed(max), [max, toFixed]);

  return {
    customLabelValuesWithRatio,
    minLabel,
    maxLabel,
  };
};
