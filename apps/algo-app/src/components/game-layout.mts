import type { RectSize } from 'ts-utils-additional';

/** How the game screen divides a window of `windowSize`. */
export const gameLayoutOf = (windowSize: RectSize): GameLayout => {
  const windowMinSideSize = Math.min(windowSize.height, windowSize.width);

  return {
    tableSize: {
      width: windowMinSideSize * 0.8,
      height: windowMinSideSize * 0.8,
    },
    headerHeight: windowSize.height * 0.05,
    footerHeight: windowSize.height * 0.1,
  };
};

export type GameLayout = Readonly<{
  tableSize: RectSize;
  headerHeight: number;
  footerHeight: number;
}>;
