import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'preact/hooks';
import { Num, Result } from 'ts-data-forge';
import {
  centreAt,
  scrollToCentre,
  type Point,
  type ScrollBox,
  type Size,
} from '../dag-zoom.mjs';
import { issuesViewStore } from '../store/index.mjs';

/**
 * The DAG's scrolling box (`issue-dag.tsx`), measured for the fit and kept
 * over the same part of the graph through a zoom: a ref to hand the box, and
 * what it is to be handed as its `onScroll`.
 *
 * The room the box has is what it shows across, and down either what it
 * shows, in a block that scrolls (`index.css`), where its height is the
 * block's whatever it holds, or elsewhere its `max-height`, since there it is
 * only as tall as the graph and a graph drawn smaller would otherwise find a
 * smaller box to fit into each time. It is measured again as the box or the
 * window is resized, which is what the `max-height` follows.
 *
 * The point of the graph at the middle of the box is noted on every scroll,
 * and put back at the middle when the scale changes, before the browser
 * draws the new size: a zoom reads as one about what is being looked at,
 * not about the graph's top left corner.
 */
export const useDagBox = (
  scale: number,
  content: Size,
): Readonly<{
  ref: (element: HTMLDivElement | null) => void;
  onScroll: () => void;
}> => {
  const mut_box = useRef<HTMLDivElement | null>(null);

  /** The scale the box was last drawn at. */
  const mut_drawnAt = useRef(scale);

  /** The size of the graph in the layout's units, as last drawn. */
  const mut_content = useRef(content);

  mut_content.current = content;

  /** The point of the graph at the middle of the box, in the layout's units. */
  const mut_centre = useRef<Point>({ x: 0, y: 0 });

  const note = useCallback((box: HTMLDivElement): void => {
    mut_centre.current = centreAt(
      scrollBoxOf(box),
      mut_content.current,
      mut_drawnAt.current,
    );
  }, []);

  const measure = useCallback(
    (box: HTMLDivElement): void => {
      issuesViewStore.setDagBox(roomOf(box));

      note(box);
    },
    [note],
  );

  const observer = useMemo(
    () =>
      new ResizeObserver(() => {
        if (mut_box.current !== null) {
          measure(mut_box.current);
        }
      }),
    [measure],
  );

  const ref = useCallback(
    (element: HTMLDivElement | null): void => {
      observer.disconnect();

      mut_box.current = element;

      if (element === null) {
        return;
      }

      observer.observe(element);

      measure(element);
    },
    [observer, measure],
  );

  useEffect(() => {
    const onResize = (): void => {
      if (mut_box.current !== null) {
        measure(mut_box.current);
      }
    };

    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, [measure]);

  useLayoutEffect(() => {
    const box = mut_box.current;

    const from = mut_drawnAt.current;

    mut_drawnAt.current = scale;

    if (box === null || from === scale) {
      return;
    }

    box.scrollTo(
      scrollToCentre(
        mut_centre.current,
        { width: box.clientWidth, height: box.clientHeight },
        scale,
      ),
    );

    // Where the browser let it go, which a graph drawn smaller can stop
    // short of.
    note(box);
  }, [scale, note]);

  const onScroll = useCallback((): void => {
    if (mut_box.current !== null) {
      note(mut_box.current);
    }
  }, [note]);

  return { ref, onScroll };
};

const scrollBoxOf = (box: HTMLDivElement): ScrollBox =>
  ({
    left: box.scrollLeft,
    top: box.scrollTop,
    width: box.clientWidth,
    height: box.clientHeight,
  }) as const;

const roomOf = (box: HTMLDivElement): Size => {
  const style = getComputedStyle(box);

  // `none` in a block that scrolls; a length in pixels elsewhere, which is
  // how a computed `70vh` reads.
  const maxHeight = pixelsOf(style.maxHeight);

  return {
    width: box.clientWidth,
    height:
      maxHeight === undefined
        ? box.clientHeight
        : maxHeight -
          (pixelsOf(style.borderTopWidth) ?? 0) -
          (pixelsOf(style.borderBottomWidth) ?? 0),
  };
};

/** A computed length such as `630px`, in pixels; `undefined` for anything else. */
const pixelsOf = (computed: string): number | undefined => {
  if (!computed.endsWith('px')) {
    return undefined;
  }

  const parsed = Num.safeParseFloat(computed.slice(0, -2));

  return Result.isOk(parsed) ? parsed.value : undefined;
};
