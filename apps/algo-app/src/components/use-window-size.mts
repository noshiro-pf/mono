import { useMemo } from 'preact/hooks';
import { type Rect, type RectSize } from 'ts-utils-additional';

export const useWindowSize = (
  windowSize: Rect,
): {
  tableSize: RectSize;
  headerHeight: number;
  footerHeight: number;
  headerStyle: preact.CSSProperties;
  footerStyle: preact.CSSProperties;
} => {
  const windowMinSideSize = useMemo(
    () => Math.min(windowSize.height, windowSize.width),
    [windowSize],
  );

  const tableSize = useMemo(
    () => ({
      width: windowMinSideSize * 0.8,
      height: windowMinSideSize * 0.8,
    }),
    [windowMinSideSize],
  );

  const headerHeight = windowSize.height * 0.05;

  const footerHeight = windowSize.height * 0.1;

  const headerStyle = useMemo<preact.CSSProperties>(
    () => ({ flexBasis: `${headerHeight}px` }),
    [headerHeight],
  );

  const footerStyle = useMemo<preact.CSSProperties>(
    () => ({ flexBasis: `${footerHeight}px` }),
    [footerHeight],
  );

  return {
    tableSize,
    headerHeight,
    footerHeight,
    headerStyle,
    footerStyle,
  };
};
