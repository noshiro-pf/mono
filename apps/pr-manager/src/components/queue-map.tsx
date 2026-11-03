import type { InitializedObservable } from 'synstate';
import { constant, For, view, type JSX } from 'synstate-dom';
import { Num } from 'ts-data-forge';
import { windowOf, type QueueStrip } from '../queue-strip.mjs';
import type { QueueSlot } from '../queue-view.mjs';

type Props = Readonly<{
  slots$: InitializedObservable<readonly QueueSlot[]>;
  strip$: InitializedObservable<QueueStrip>;
  /** Clicked at `fraction` of the way across. */
  onJump: (fraction: number) => void;
}>;

/**
 * The whole queue on one line above the strip of boxes, when the strip does not
 * show all of it (`queue-section.tsx`): a mark for each box, drawn by the same
 * rules (running, waiting, failing, priority), and a frame round the part in
 * view that moves as the strip scrolls. A click scrolls the strip there.
 *
 * Hidden from a screen reader and out of the tab order: it adds nothing the
 * boxes do not say, and focusing a box scrolls it into view.
 */
export const QueueMap = ({ slots$, strip$, onJump }: Props): JSX.Element => (
  <div
    aria-hidden={constant('true')}
    class={constant('queue-map')}
    title={constant('The whole queue; click to scroll there')}
    onClick={(event: MouseEvent) => {
      const { currentTarget } = event;

      if (!(currentTarget instanceof HTMLElement)) {
        return;
      }

      const { left, width } = currentTarget.getBoundingClientRect();

      if (Num.isNonZero(width)) {
        onJump(Num.div(event.clientX - left, width));
      }
    }}
  >
    <For items={slots$} key={(slot) => slot.number}>
      {(slot$) => (
        <span
          class={constant('queue-map-mark')}
          data-kind={view(slot$, (slot) => slot.kind)}
          data-priority={view(slot$, (slot) => slot.priority)}
        />
      )}
    </For>

    <span
      class={constant('queue-map-window')}
      style={{
        left: view(strip$, (strip) => percent(windowOf(strip).start)),
        width: view(strip$, (strip) => percent(windowOf(strip).size)),
      }}
    />
  </div>
);

const percent = (fraction: number): string => `${fraction * 100}%` as const;
