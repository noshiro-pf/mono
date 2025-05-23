import { Arr } from '@noshiro/ts-utils';
import { useState } from 'better-preact-use-state';
import { useEffect, useMemo, useRef } from 'preact/hooks';
import { ResizeObserver as CustomResizeObserver } from 'resize-observer';

type Size = Readonly<{
  height: number;
  left: number;
  top: number;
  width: number;
}>;

export const useResizeObserverRef = <E extends Element = Element>(
  setSize: (v: Size) => void,
): preact.RefObject<E> => {
  const rootResizeObserver = useMemo(
    () =>
      new CustomResizeObserver((entries) => {
        if (Arr.isNonEmpty(entries)) {
          setSize(entries[0].contentRect);
        }
      }),
    [setSize],
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
  defaultSize?: Size,
): [Size, preact.RefObject<E>] => {
  const [size, setSize] = useState<Size>(
    defaultSize ?? { width: 0, height: 0, left: 0, top: 0 },
  );

  const targetElRef = useResizeObserverRef<E>(setSize);

  return [size, targetElRef];
};
