import * as React from 'react';
import { Arr, Num, pipe } from 'ts-data-forge';
import { type DeepReadonly, type UintRange } from 'ts-type-forge';
import { formatPercentage } from './utils.mjs';

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
  labelFractionDigits?: UintRange<0, 21>;
  customLabelValues?: number[];
}>): Readonly<{
  customLabelValuesWithRatio: DeepReadonly<
    {
      value: number;
      ratio: number;
      cssStyle: React.CSSProperties;
    }[]
  >;
  minLabel: string;
  maxLabel: string;
}> => {
  const customLabelValuesWithRatio = React.useMemo(() => {
    if (customLabelValues === undefined) return [];

    const isInRangeInclusive = Num.isInRangeInclusive(min, max);

    if (!customLabelValues.every(isInRangeInclusive)) {
      console.error('all values should be in [min, max].');

      return [];
    }

    return pipe(customLabelValues)
      .map(Arr.uniq)
      .map((list) =>
        list.map((x) => ({
          value: x,
          ratio: toRatio(x) ?? 0,
          cssStyle: { left: formatPercentage(toRatio(x) ?? 0) },
        })),
      ).value;
  }, [customLabelValues, min, max, toRatio]);

  const toFixed = React.useMemo(
    () => (n: number) => n.toFixed(labelFractionDigits),
    [labelFractionDigits],
  );

  const minLabel = React.useMemo(() => toFixed(min), [min, toFixed]);

  const maxLabel = React.useMemo(() => toFixed(max), [max, toFixed]);

  return {
    customLabelValuesWithRatio,
    minLabel,
    maxLabel,
  };
};
