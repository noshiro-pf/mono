import { onScopeDispose, type InitializedObservable } from 'synstate';
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
 * over the same part of the graph through a zoom: a `ref` to hand the box,
 * and what it is to be handed as its `onScroll`. Called while the DAG is
 * mounted; what it listens to is released with the scope it was called in.
 *
 * The room the box has is what it shows across, and down either what it
 * shows, in a block that scrolls (`index.css`), where its height is the
 * block's whatever it holds, or elsewhere its `max-height`, since there it is
 * only as tall as the graph and a graph drawn smaller would otherwise find a
 * smaller box to fit into each time. It is measured once it is laid out and
 * again as the box or the window is resized, which is what the `max-height`
 * follows.
 *
 * The point of the graph at the middle of the box is noted on every scroll,
 * and put back at the middle when the scale changes, before the browser
 * draws the new size: a zoom reads as one about what is being looked at,
 * not about the graph's top left corner.
 */
export const dagBox = (
  scale$: InitializedObservable<number>,
  content$: InitializedObservable<Size>,
): Readonly<{
  ref: (element: HTMLDivElement) => void;
  onScroll: () => void;
}> => {
  const mut_state: {
    box: HTMLDivElement | undefined;
    /** The scale the box was last drawn at. */
    drawnAt: number;
    /** The point of the graph at the middle of the box, in the layout's units. */
    centre: Point;
  } = {
    box: undefined,
    drawnAt: scale$.getSnapshot().value,
    centre: { x: 0, y: 0 },
  };

  const note = (box: HTMLDivElement): void => {
    mut_state.centre = centreAt(
      scrollBoxOf(box),
      content$.getSnapshot().value,
      mut_state.drawnAt,
    );
  };

  const measure = (): void => {
    if (mut_state.box === undefined) {
      return;
    }

    issuesViewStore.setDagBox(roomOf(mut_state.box));

    note(mut_state.box);
  };

  // Its first answer comes once the box is laid out, which is when there is
  // a size to read: the `ref` is called before the box is in the document.
  const observer = new ResizeObserver(measure);

  window.addEventListener('resize', measure);

  // In a microtask, so that the SVG has its new size, written in the same
  // update, and the browser has not drawn it yet.
  const subscription = scale$.subscribe((scale) => {
    queueMicrotask(() => {
      const { box, drawnAt: from } = mut_state;

      mut_state.drawnAt = scale;

      if (box === undefined || from === scale) {
        return;
      }

      box.scrollTo(
        scrollToCentre(
          mut_state.centre,
          { width: box.clientWidth, height: box.clientHeight },
          scale,
        ),
      );

      // Where the browser let it go, which a graph drawn smaller can stop
      // short of.
      note(box);
    });
  });

  onScopeDispose(() => {
    subscription.unsubscribe();

    observer.disconnect();

    window.removeEventListener('resize', measure);
  });

  return {
    ref: (element) => {
      mut_state.box = element;

      observer.observe(element);
    },
    onScroll: () => {
      if (mut_state.box !== undefined) {
        note(mut_state.box);
      }
    },
  };
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
