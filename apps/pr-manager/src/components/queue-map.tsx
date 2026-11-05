import {
  createState,
  map,
  onScopeDispose,
  type InitializedObservable,
} from 'synstate';
import { constant, For, inlineMap, type JSX } from 'synstate-dom';
import { Num } from 'ts-data-forge';
import { inWindow, windowOf, type QueueStrip } from '../queue-strip.mjs';
import type { QueueSlot } from '../queue-view.mjs';

type Props = Readonly<{
  slots$: InitializedObservable<readonly QueueSlot[]>;
  strip$: InitializedObservable<QueueStrip>;
  /** Pressed at `fraction` of the way across. */
  onPress: (fraction: number) => void;
  /** The pointer pressed is now at `fraction` of the way across, or beyond. */
  onDrag: (fraction: number) => void;
  /**
   * The pointer pressed is up, having moved too little to be a drag or not, or
   * lost, as when a touch turns out to scroll the page.
   */
  onRelease: (how: QueueMapRelease) => void;
}>;

/**
 * The whole queue on one line above the strip of boxes, when the strip does not
 * show all of it (`queue-section.tsx`): a mark for each box, drawn by the same
 * rules (running, waiting, failing, priority), and a frame round the part in
 * view that moves as the strip scrolls. The frame is dragged like a scroll
 * bar's thumb; a click elsewhere scrolls the strip there, and a drag from
 * elsewhere drags the frame as if it had been there.
 *
 * Hidden from a screen reader and out of the tab order: it adds nothing the
 * boxes do not say, and focusing a box scrolls it into view.
 */
export const QueueMap = ({
  slots$,
  strip$,
  onPress,
  onDrag,
  onRelease,
}: Props): JSX.Element => {
  const mut_press: {
    /** The pointer pressed, until it is up or lost; one at a time. */
    pointer: number | undefined;
    /** Where it was pressed, in client pixels. */
    x: number;
    /** Moved far enough since to be a drag rather than a click. */
    moved: boolean;
  } = { pointer: undefined, x: 0, moved: false };

  // Pressed on the frame, or dragging from elsewhere: the frame is in hand.
  const [grabbed$, setGrabbed] = createState(false);

  const window$ = strip$.pipe(map(windowOf));

  const release = (how: 'up' | 'lost'): void => {
    mut_press.pointer = undefined;

    setGrabbed(false);

    onRelease(how === 'lost' ? 'lost' : mut_press.moved ? 'drag' : 'click');
  };

  // Made to fit while it is dragged, the map goes, and its pointer with it.
  onScopeDispose(() => {
    if (mut_press.pointer !== undefined) {
      release('lost');
    }
  });

  return (
    <div
      aria-hidden={constant('true')}
      class={constant('queue-map')}
      data-grabbed={inlineMap(grabbed$, (grabbed) => grabbed.toString())}
      title={constant(
        'The whole queue; drag the frame, or click to scroll there',
      )}
      // After `pointerup` for a click or a drag; alone for a touch that scrolls
      // the page instead.
      onLostPointerCapture={(lost) => {
        if (lost.pointerId === mut_press.pointer) {
          release('lost');
        }
      }}
      onPointerDown={(pressed) => {
        if (pressed.button !== 0) {
          return;
        }

        if (mut_press.pointer !== undefined) {
          // Another pointer's press is let be; this one's own, whose end never
          // came (a context menu can take it), is over.
          if (pressed.pointerId !== mut_press.pointer) {
            return;
          }

          release('lost');
        }

        const fraction = fractionOf(pressed);

        if (fraction === undefined) {
          return;
        }

        // No text selection. The page is kept from panning on a touch screen by
        // `touch-action` (`index.css`), which a pointer event cannot cancel.
        pressed.preventDefault();

        pressed.currentTarget.setPointerCapture(pressed.pointerId);

        mut_press.pointer = pressed.pointerId;

        mut_press.x = pressed.clientX;

        mut_press.moved = false;

        setGrabbed(inWindow(strip$.getSnapshot().value, fraction));

        onPress(fraction);
      }}
      onPointerMove={(moved) => {
        if (moved.pointerId !== mut_press.pointer) {
          return;
        }

        if (
          !mut_press.moved &&
          Math.abs(moved.clientX - mut_press.x) < DRAG_THRESHOLD
        ) {
          return;
        }

        mut_press.moved = true;

        setGrabbed(true);

        const fraction = fractionOf(moved);

        if (fraction !== undefined) {
          onDrag(fraction);
        }
      }}
      onPointerUp={(up) => {
        if (up.pointerId === mut_press.pointer) {
          release('up');
        }
      }}
    >
      <For items={slots$} key={(slot) => slot.number}>
        {(slot$) => (
          <span
            class={constant('queue-map-mark')}
            data-kind={inlineMap(slot$, (slot) => slot.kind)}
            data-priority={inlineMap(slot$, (slot) => slot.priority)}
          />
        )}
      </For>

      <span
        class={constant('queue-map-window')}
        style={{
          left: inlineMap(window$, ({ start }) => percent(start)),
          width: inlineMap(window$, ({ size }) => percent(size)),
        }}
      />
    </div>
  );
};

/** How a press on the map ended. */
export type QueueMapRelease = 'click' | 'drag' | 'lost';

/** How far, in CSS pixels, a pressed pointer moves before it drags. */
const DRAG_THRESHOLD = 3;

/** How far across the map the pointer is; beyond 0–1 when off either end. */
const fractionOf = (
  event: PointerEvent & Readonly<{ currentTarget: HTMLDivElement }>,
): number | undefined => {
  const { left, width } = event.currentTarget.getBoundingClientRect();

  return Num.isNonZero(width)
    ? Num.div(event.clientX - left, width)
    : undefined;
};

const percent = (fraction: number): string => `${fraction * 100}%` as const;
