import { type Rect, type RectSize } from '@noshiro/ts-utils-additional';

export const { state: windowSize$, setState: setWindowSize } = createState<
  Rect | undefined
>(undefined);

type ElementsSize = Readonly<{
  windowSize: Rect;
  tableSize: RectSize;
  headerHeight: number;
  footerHeight: number;
  headerStyle: preact.JSX.CSSProperties;
  footerStyle: preact.JSX.CSSProperties;
}>;

const elementsSizeFromWindowSize = (
  windowSize: Rect | undefined,
): ElementsSize | undefined => {
  if (windowSize === undefined) return undefined;

  const windowMinSideSize = Math.floor(
    Math.min(windowSize.height, windowSize.width),
  );

  const tableOneSideLength = Math.floor(windowMinSideSize * 0.85);

  const tableSize = {
    width: tableOneSideLength,
    height: tableOneSideLength,
  };

  const headerHeight = Math.floor(windowSize.height * 0.05);

  const footerHeight = Math.floor(windowSize.height * 0.1);

  const headerStyle: preact.JSX.CSSProperties = {
    height: `${headerHeight}px`,
  };

  const footerStyle: preact.JSX.CSSProperties = {
    height: `${footerHeight}px`,
  };

  return {
    windowSize,
    tableSize,
    headerHeight,
    footerHeight,
    headerStyle,
    footerStyle,
  };
};

const elementsSize$: InitializedObservable<ElementsSize | undefined> =
  windowSize$.chain(auditTime(500)).chain(map(elementsSizeFromWindowSize));

export const ElementSize = {
  windowSize$,
  setWindowSize,
  elementsSize$,
} as const;
