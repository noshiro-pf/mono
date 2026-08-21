import * as React from 'react';
import { Num, pipe } from 'ts-data-forge';
import { type DeepReadonly, type UintRange } from 'ts-type-forge';

export const useNormalizedRangeSliderProps = ({
  min: _min,
  max: _max,
  range: _range,
  stepSize: _stepSize,
  labelStepSize: _labelStepSize,
  labelFractionDigits: _labelFractionDigits,
}: DeepReadonly<{
  max: number;
  min: number;
  range: { min: number; max: number };
  stepSize: number;
  labelStepSize?: number;
  labelFractionDigits?: UintRange<0, 21>;
}>): Readonly<{
  max: number;
  min: number;
  range: Readonly<{ min: number; max: number }>;
  stepSize: number;
  labelStepSize: number;
  labelFractionDigits: UintRange<0, 21>;
}> => {
  const min = React.useMemo(() => {
    if (!Number.isFinite(_min)) {
      console.error('`min` should be finite.');

      return defaultValues.min;
    }

    return _min;
  }, [_min]);

  const max = React.useMemo(() => {
    if (!Number.isFinite(_max)) {
      console.error('`max` should be finite.');

      return defaultValues.max;
    }

    return Math.max(_max, min);
  }, [min, _max]);

  const clamp = React.useMemo(() => Num.clamp(min, max), [min, max]);

  const stepSize = React.useMemo(() => {
    if (!Number.isFinite(_stepSize)) {
      console.error('`stepSize` should be finite.');

      return defaultValues.stepSize;
    }

    return _stepSize;
  }, [_stepSize]);

  const labelStepSize = React.useMemo(() => {
    if (_labelStepSize === undefined) return stepSize;

    if (!Number.isFinite(_labelStepSize)) {
      console.error('`labelStepSize` should be finite.');

      return defaultValues.labelStepSize;
    }

    return _labelStepSize;
  }, [_labelStepSize, stepSize]);

  const range = React.useMemo(
    () => ({
      min: clamp(_range.min),
      max: clamp(Math.max(_range.min, _range.max)),
    }),
    [_range, clamp],
  );

  const labelFractionDigits: UintRange<0, 21> = React.useMemo(
    () =>
      _labelFractionDigits ??
      pipe(-Math.floor(Math.log10(labelStepSize))).map((x) =>
        Num.isUintInRangeInclusive(0, 20)(x) ? x : 0,
      ).value,
    [_labelFractionDigits, labelStepSize],
  );

  return {
    max,
    min,
    range,
    stepSize,
    labelFractionDigits,
    labelStepSize,
  };
};

const defaultValues = {
  min: 0,
  max: 10,
  stepSize: 1,
  labelStepSize: 1,
} as const;
