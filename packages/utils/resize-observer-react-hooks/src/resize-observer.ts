import { useState } from '@noshiro/react-utils';
import { IList } from '@noshiro/ts-utils';
import type { RefObject } from 'react';
import { useEffect, useMemo, useRef } from 'react';
import { ResizeObserver as CustomResizeObserver } from 'resize-observer';

type Size = Readonly<{
  height: number;
  left: number;
  top: number;
  width: number;
}>;

export const useResizeObserverRef = <E extends Element = Element>(
  setSize: (v: Size) => void
): RefObject<E> => {
  const rootResizeObserver = useMemo(
    () =>
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      new CustomResizeObserver((entries) => {
        if (IList.isNonEmpty(entries)) {
          setSize(entries[0].contentRect);
        }
      }),
    [setSize]
  );

  const targetElRef = useRef<E>(null);

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

export const useResizeObserver = <E extends Element = Element>(
  defaultSize?: Size
): [Size, RefObject<E>] => {
  const { state: size, setState: setSize } = useState<Size>(
    defaultSize ?? { width: 0, height: 0, left: 0, top: 0 }
  );

  const targetElRef = useResizeObserverRef<E>(setSize);

  return [size, targetElRef];
};
