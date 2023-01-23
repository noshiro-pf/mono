import { type Rect, type RectSize } from '@noshiro/ts-utils-additional';

export const useWindowSize = (
  windowSize: Rect
): {
  tableSize: RectSize;
  headerHeight: number;
  footerHeight: number;
  headerStyle: CSSProperties;
  footerStyle: CSSProperties;
} => {
  const windowMinSideSize = useMemo(
    () => Math.min(windowSize.height, windowSize.width),
    [windowSize]
  );

  const tableSize = useMemo(
    () => ({
      width: windowMinSideSize * 0.8,
      height: windowMinSideSize * 0.8,
    }),
    [windowMinSideSize]
  );

  const headerHeight = windowSize.height * 0.05;
  const footerHeight = windowSize.height * 0.1;

  const headerStyle = useMemo<CSSProperties>(
    () => ({ flexBasis: `${headerHeight}px` }),
    [headerHeight]
  );
  const footerStyle = useMemo<CSSProperties>(
    () => ({ flexBasis: `${footerHeight}px` }),
    [footerHeight]
  );

  return {
    tableSize,
    headerHeight,
    footerHeight,
    headerStyle,
    footerStyle,
  };
};
