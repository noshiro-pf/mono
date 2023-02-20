import { formatPercentage } from './utils';

const handleSize = { width: '8px' } as const;

export const useRangeSliderInlineStyles = (
  leftRatio: number,
  rightRatio: number
): Readonly<{
  progressStartStyle: React.CSSProperties;
  progressMidStyle: React.CSSProperties;
  progressEndStyle: React.CSSProperties;
  leftHandleStyle: React.CSSProperties;
  rightHandleStyle: React.CSSProperties;
}> => {
  const progressStartStyle: React.CSSProperties = useMemo(
    () => ({
      left: formatPercentage(0),
      right: formatPercentage(1 - leftRatio),
      top: '0px',
    }),
    [leftRatio]
  );

  const progressMidStyle: React.CSSProperties = useMemo(
    () => ({
      left: formatPercentage(leftRatio),
      right: formatPercentage(1 - rightRatio),
      top: '0px',
    }),
    [leftRatio, rightRatio]
  );

  const progressEndStyle: React.CSSProperties = useMemo(
    () => ({
      left: formatPercentage(rightRatio),
      right: formatPercentage(0),
      top: '0px',
    }),
    [rightRatio]
  );

  const leftHandleStyle: React.CSSProperties = useMemo(
    () => ({
      left: `calc(${formatPercentage(leftRatio)} - ${handleSize.width})`,
    }),
    [leftRatio]
  );

  const rightHandleStyle: React.CSSProperties = useMemo(
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
