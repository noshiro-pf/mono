import * as React from 'react';
import { useValueAsRef } from 'react-utils';

export const useOnRangeChangeHandlerHook = (
  range: Readonly<{ min: number; max: number }>,
  onChange?: (value: Readonly<{ min: number; max: number }>) => void,
  onRelease?: (value: Readonly<{ min: number; max: number }>) => void,
): Readonly<{
  onRangeMinChange: (x: number) => void;
  onRangeMaxChange: (x: number) => void;
  onRangeMinRelease: (x: number) => void;
  onRangeMaxRelease: (x: number) => void;
}> => {
  const rangeRef = useValueAsRef(range);

  const onRangeMinChange = React.useCallback(
    (value: number) =>
      onChange?.({
        min: value,
        max: rangeRef.current.max,
      }),
    [onChange, rangeRef],
  );

  const onRangeMaxChange = React.useCallback(
    (value: number) =>
      onChange?.({
        min: rangeRef.current.min,
        max: value,
      }),
    [onChange, rangeRef],
  );

  const onRangeMinRelease = React.useCallback(
    (value: number) =>
      onRelease?.({
        min: value,
        max: rangeRef.current.max,
      }),
    [onRelease, rangeRef],
  );

  const onRangeMaxRelease = React.useCallback(
    (value: number) =>
      onRelease?.({
        min: rangeRef.current.min,
        max: value,
      }),
    [onRelease, rangeRef],
  );

  return {
    onRangeMinChange,
    onRangeMaxChange,
    onRangeMinRelease,
    onRangeMaxRelease,
  };
};
