import * as React from 'react';
import { Num, pipe } from 'ts-data-forge';
import { type DeepReadonly } from 'ts-type-forge';

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
  const toRatio = React.useCallback(
    (x: number) =>
      pipe(max - min).map((l) =>
        Num.isPositive(l) ? Num.div(x - min, l) : undefined,
      ).value,
    [min, max],
  );

  const leftRatio: number = React.useMemo(
    () => toRatio(range.min) ?? 0,
    [range, toRatio],
  );

  const rightRatio: number = React.useMemo(
    () => toRatio(range.max) ?? 1,
    [range, toRatio],
  );

  return {
    toRatio,
    leftRatio,
    rightRatio,
  };
};
