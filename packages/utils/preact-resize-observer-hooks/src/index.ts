import { isNonEmpty } from '@noshiro/ts-utils';
import type { RefObject } from 'preact';
import { useEffect, useMemo, useRef, useState } from 'preact/compat';
import { ResizeObserver as CustomResizeObserver } from 'resize-observer';

type Size = Readonly<{
  height: number;
  left: number;
  top: number;
  width: number;
}>;

export const useResizeObserverRef = (
  setSize: (v: Size) => void
): RefObject<HTMLDivElement> => {
  const rootResizeObserver = useMemo(
    () =>
      // eslint-disable-next-line noshiro-custom/prefer-readonly-parameter-types
      new CustomResizeObserver((entries) => {
        if (isNonEmpty(entries)) {
          setSize(entries[0].contentRect);
        }
      }),
    [setSize]
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
  defaultSize: Size = { width: 0, height: 0, left: 0, top: 0 }
): [Size, RefObject<HTMLDivElement>] => {
  const [size, setSize] = useState<Size>(defaultSize);

  const targetElRef = useResizeObserverRef(setSize);

  return [size, targetElRef];
};
