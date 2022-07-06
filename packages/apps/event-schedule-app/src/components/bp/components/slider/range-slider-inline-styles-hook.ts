import { formatPercentage } from './utils';

const handleSize = { width: '8px' } as const;

export const useRangeSliderInlineStyles = (
  leftRatio: number,
  rightRatio: number
): Readonly<{
  progressStartStyle: CSSProperties;
  progressMidStyle: CSSProperties;
  progressEndStyle: CSSProperties;
  leftHandleStyle: CSSProperties;
  rightHandleStyle: CSSProperties;
}> => {
  const progressStartStyle: CSSProperties = useMemo(
    () => ({
      left: formatPercentage(0),
      right: formatPercentage(1 - leftRatio),
      top: '0px',
    }),
    [leftRatio]
  );

  const progressMidStyle: CSSProperties = useMemo(
    () => ({
      left: formatPercentage(leftRatio),
      right: formatPercentage(1 - rightRatio),
      top: '0px',
    }),
    [leftRatio, rightRatio]
  );

  const progressEndStyle: CSSProperties = useMemo(
    () => ({
      left: formatPercentage(rightRatio),
      right: formatPercentage(0),
      top: '0px',
    }),
    [rightRatio]
  );

  const leftHandleStyle: CSSProperties = useMemo(
    () => ({
      left: `calc(${formatPercentage(leftRatio)} - ${handleSize.width})`,
    }),
    [leftRatio]
  );

  const rightHandleStyle: CSSProperties = useMemo(
    () => ({
      left: `calc(${formatPercentage(rightRatio)} - ${handleSize.width})`,
    }),
    [rightRatio]
  );

  return {
    progressStartStyle,
    progressMidStyle,
    progressEndStyle,
    leftHandleStyle,
    rightHandleStyle,
  };
};
