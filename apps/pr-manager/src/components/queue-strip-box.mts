import {
  createState,
  onScopeDispose,
  type InitializedObservable,
} from 'synstate';
import {
  draggedLeft,
  inWindow,
  NO_STRIP,
  scrollLeftAt,
  wheeledLeft,
  type QueueStrip,
} from '../queue-strip.mjs';
import type { QueueMapRelease } from './queue-map.js';

/**
 * The Queue block's strip of boxes (`queue-section.tsx`), measured: a `ref` to
 * hand the list that scrolls, what it is to be handed as its `onScroll`, where
 * it is as last measured, and what a press and a drag on the map do to it. Called
 * while the block is mounted; what it listens to is released with the scope it
 * was called in.
 *
 * It is measured as it scrolls, as it is resized, and as boxes come and go or
 * start running, which change how wide they are together, or which is held at
 * the start, without changing the list's own size: at most once a frame, and
 * passed on only when something changed.
 */
export const queueStripBox = (): Readonly<{
  ref: (element: HTMLElement) => void;
  onScroll: () => void;
  strip$: InitializedObservable<QueueStrip>;
  /**
   * Pressed on the map at `fraction` of its width. Inside the frame round the
   * part in view, the strip stops where it is, to be dragged from there as a
   * scroll bar's thumb is; outside, a drag starts from where the point is in
   * the middle.
   */
  press: (fraction: number) => void;
  /** The pointer pressed on the map has moved, to `fraction` of its width. */
  dragTo: (fraction: number) => void;
  /**
   * The press on the map is over. A click outside the frame scrolls the strip,
   * smoothly, to where a drag would have started; a pointer lost to it, as when
   * a touch turns out to scroll the page, puts the strip back where it was.
   */
  release: (how: QueueMapRelease) => void;
  /**
   * A wheel turned over the strip or its map: a vertical one scrolls the strip
   * across, where it can move that way (`wheeledLeft`).
   */
  wheel: (event: WheelEvent) => void;
}> => {
  const mut_state: {
    list: HTMLElement | undefined;
    /** A measurement asked for and not yet taken. */
    frame: number | undefined;
    /**
     * Where on the map the pointer was pressed, and where the strip was, or is
     * being scrolled to, then.
     */
    drag:
      | Readonly<{
          at: number;
          from: number;
          /** Where the strip was before the press. */
          before: number;
          /** Pressed outside the frame. */
          outside: boolean;
        }>
      | undefined;
  } = {
    list: undefined,
    frame: undefined,
    drag: undefined,
  };

  const [strip$, setStrip] = createState<QueueStrip>(NO_STRIP);

  const measure = (): void => {
    mut_state.frame = undefined;

    const { list } = mut_state;

    if (list === undefined) {
      return;
    }

    const next = measured(list);

    if (!sameStrip(next, strip$.getSnapshot().value)) {
      setStrip(next);
    }
  };

  const request = (): void => {
    mut_state.frame ??= requestAnimationFrame(measure);
  };

  // Its first answer comes once the list is laid out, which is when there is a
  // size to read: the `ref` is called before the list is in the document.
  const resized = new ResizeObserver(request);

  const changed = new MutationObserver(request);

  // A box that starts or stops running where it is changes what is held.
  const kindChanged = new MutationObserver(request);

  onScopeDispose(() => {
    resized.disconnect();

    changed.disconnect();

    kindChanged.disconnect();

    if (mut_state.frame !== undefined) {
      cancelAnimationFrame(mut_state.frame);
    }
  });

  return {
    // A list is made again each time the queue empties and fills; only the
    // latest one is watched.
    ref: (element) => {
      resized.disconnect();

      changed.disconnect();

      kindChanged.disconnect();

      mut_state.list = element;

      resized.observe(element);

      changed.observe(element, { childList: true });

      kindChanged.observe(element, {
        subtree: true,
        attributeFilter: ['data-kind'],
      });
    },
    onScroll: request,
    strip$,
    press: (fraction) => {
      const { list } = mut_state;

      if (list === undefined) {
        return;
      }

      const strip = strip$.getSnapshot().value;

      // Where the strip is now rather than as last measured: a frame grabbed
      // while a jump is still scrolling it stops under the pointer.
      const before = list.scrollLeft;

      if (!inWindow(strip, fraction)) {
        mut_state.drag = {
          at: fraction,
          from: scrollLeftAt(strip, fraction),
          before,
          outside: true,
        };

        return;
      }

      mut_state.drag = { at: fraction, from: before, before, outside: false };

      // Scrolling ends a smooth scroll still under way (CSSOM View).
      list.scrollTo({ left: before, behavior: 'instant' });
    },
    dragTo: (fraction) => {
      const { drag, list } = mut_state;

      if (drag === undefined || list === undefined) {
        return;
      }

      list.scrollTo({
        left: draggedLeft(
          strip$.getSnapshot().value,
          drag.from,
          fraction - drag.at,
        ),
        behavior: 'instant',
      });
    },
    release: (how) => {
      const { drag, list } = mut_state;

      mut_state.drag = undefined;

      if (drag === undefined || list === undefined) {
        return;
      }

      if (how === 'lost') {
        list.scrollTo({ left: drag.before, behavior: 'instant' });
      } else if (how === 'click' && drag.outside) {
        list.scrollTo({ left: drag.from, behavior: 'smooth' });
      }
    },
    wheel: (event) => {
      const { list } = mut_state;

      if (list === undefined) {
        return;
      }

      // Measured now rather than as last measured: wheel events come faster
      // than frames, and each moves on from where the one before left it.
      const left = wheeledLeft(measured(list), event);

      if (left === undefined) {
        return;
      }

      event.preventDefault();

      list.scrollTo({ left, behavior: 'instant' });
    },
  };
};

const measured = (list: HTMLElement): QueueStrip => {
  // The running box held at the start (`index.css`).
  const first = list.firstElementChild;

  return {
    left: list.scrollLeft,
    width: list.clientWidth,
    scrollWidth: list.scrollWidth,
    held:
      first instanceof HTMLElement && first.dataset['kind'] === 'running'
        ? first.offsetWidth
        : 0,
  };
};

const sameStrip = (a: QueueStrip, b: QueueStrip): boolean =>
  a.left === b.left &&
  a.width === b.width &&
  a.scrollWidth === b.scrollWidth &&
  a.held === b.held;
