import { useCallback, useMemo, useState } from 'preact/hooks';

/**
 * The height of an element as it is drawn, border included, kept current as
 * it changes: a ref to hand the element, and the height in pixels, which is
 * 0 until the element has been drawn.
 *
 * Through the ref rather than an effect, so that what is observed is
 * whatever element the ref is on, and nothing is once it is gone: Preact
 * calls the ref with `null` when the element leaves.
 */
export const useBorderBoxHeight = <E extends Element>(): readonly [
  ref: (element: E | null) => void,
  height: number,
] => {
  const [height, setHeight] = useState(0);

  const observer = useMemo(
    () =>
      new ResizeObserver((entries) => {
        const size = entries.at(-1)?.borderBoxSize[0];

        if (size !== undefined) {
          setHeight(size.blockSize);
        }
      }),
    [],
  );

  const ref = useCallback(
    (element: E | null): void => {
      observer.disconnect();

      if (element !== null) {
        observer.observe(element, { box: 'border-box' });
      }
    },
    [observer],
  );

  return [ref, height];
};
