import type { RectSize } from 'ts-utils-additional';

/**
 * How the game screen divides a window of `windowSize`, in whole pixels, so
 * that the table's grid does not land between them.
 */
export const gameLayoutOf = (windowSize: RectSize): GameLayout => {
  const windowMinSideSize = Math.floor(
    Math.min(windowSize.height, windowSize.width),
  );

  const tableOneSideLength = Math.floor(windowMinSideSize * 0.85);

  return {
    tableSize: {
      width: tableOneSideLength,
      height: tableOneSideLength,
    },
    headerHeight: Math.floor(windowSize.height * 0.05),
    footerHeight: Math.floor(windowSize.height * 0.1),
  };
};

export type GameLayout = Readonly<{
  tableSize: RectSize;
  headerHeight: number;
  footerHeight: number;
}>;
