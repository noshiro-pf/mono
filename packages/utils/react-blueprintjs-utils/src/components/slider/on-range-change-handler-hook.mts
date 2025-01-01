import { useValueAsRef } from '@noshiro/react-utils';
import { useCallback } from 'react';

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

  const onRangeMinChange = useCallback(
    (value: number) =>
      onChange?.({
        min: value,
        max: rangeRef.current.max,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onChange],
  );

  const onRangeMaxChange = useCallback(
    (value: number) =>
      onChange?.({
        min: rangeRef.current.min,
        max: value,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onChange],
  );

  const onRangeMinRelease = useCallback(
    (value: number) =>
      onRelease?.({
        min: value,
        max: rangeRef.current.max,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onRelease],
  );

  const onRangeMaxRelease = useCallback(
    (value: number) =>
      onRelease?.({
        min: rangeRef.current.min,
        max: value,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onRelease],
  );

  return {
    onRangeMinChange,
    onRangeMaxChange,
    onRangeMinRelease,
    onRangeMaxRelease,
  };
};
