import { useState } from 'better-react-use-state';
import * as React from 'react';
import { Arr } from 'ts-data-forge';

type Size = Readonly<{
  height: number;
  left: number;
  top: number;
  width: number;
}>;

export const useResizeObserverRef = <E extends Element = Element>(
  setSize: (v: Size) => void,
): React.RefObject<E | null> => {
  // The `resize-observer` polyfill this used is no longer needed: every
  // browser this app targets ships `ResizeObserver`, and `lib.dom` types it.
  const rootResizeObserver = React.useMemo(
    () =>
      new ResizeObserver((entries) => {
        if (Arr.isNonEmpty(entries)) {
          setSize(entries[0].contentRect);
        }
      }),
    [setSize],
  );

  const targetElRef = React.useRef<E>(null);

  React.useEffect(() => {
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
): readonly [size: Size, ref: React.RefObject<E | null>] => {
  const [size, setSize] = useState<Size>(
    defaultSize ?? { width: 0, height: 0, left: 0, top: 0 },
  );

  const targetElRef = useResizeObserverRef<E>(setSize);

  return [size, targetElRef];
};
