import { isArrayOfLength1OrMore, RectSize } from '@mono/ts-utils';
import { RefObject, useEffect, useMemo, useRef, useState } from 'react';
import { ResizeObserver } from 'resize-observer';

export const useResizeObserverRef = (
  setRootRectSize: (v: RectSize) => void
): RefObject<HTMLDivElement> => {
  const rootResizeObserver = useMemo(
    () =>
      new ResizeObserver((entries) => {
        if (isArrayOfLength1OrMore(entries)) {
          const contentRect = entries[0].contentRect;
          setRootRectSize({
            width: contentRect.width,
            height: contentRect.height,
          });
        }
      }),
    [setRootRectSize]
  );

  const targetElRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = targetElRef.current;
    if (el !== null) {
      rootResizeObserver.observe(el);
    }
    return () => {
      if (el !== null) {
        rootResizeObserver.unobserve(el);
      }
      rootResizeObserver.disconnect();
    };
  }, [targetElRef, rootResizeObserver]);

  return targetElRef;
};

export const useResizeObserver = (
  defaultRectSize: RectSize = {
    width: 0,
    height: 0,
  }
): [RectSize, RefObject<HTMLDivElement>] => {
  const [rootRectSize, setRootRectSize] = useState<RectSize>(defaultRectSize);

  const targetElRef = useResizeObserverRef(setRootRectSize);

  return [rootRectSize, targetElRef];
};
