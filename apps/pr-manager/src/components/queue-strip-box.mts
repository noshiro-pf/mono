import {
  createState,
  onScopeDispose,
  type InitializedObservable,
} from 'synstate';
import { NO_STRIP, scrollLeftAt, type QueueStrip } from '../queue-strip.mjs';

/**
 * The Queue block's strip of boxes (`queue-section.tsx`), measured: a `ref` to
 * hand the list that scrolls, what it is to be handed as its `onScroll`, where
 * it is as last measured, and a way to scroll it to a point of the map. Called
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
  /** Scrolls so that the point of the map at `fraction` is in the middle. */
  jumpTo: (fraction: number) => void;
}> => {
  const mut_state: {
    list: HTMLElement | undefined;
    /** A measurement asked for and not yet taken. */
    frame: number | undefined;
  } = {
    list: undefined,
    frame: undefined,
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
    jumpTo: (fraction) => {
      mut_state.list?.scrollTo({
        left: scrollLeftAt(strip$.getSnapshot().value, fraction),
        behavior: 'smooth',
      });
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
