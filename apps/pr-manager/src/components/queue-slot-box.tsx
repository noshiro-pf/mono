import { type InitializedObservable, map } from 'synstate';
import { constant, If, type JSX } from 'synstate-dom';
import { Optional } from 'ts-data-forge';
import type { QueueSlot } from '../queue-view.mjs';
import { ExternalLink } from './external-link.js';
import { RunStateIcon } from './run-state-icon.js';

type Props = Readonly<{
  slot$: InitializedObservable<QueueSlot>;
  /** Pointed at or focused: its tooltip is shown (`queue-tip.tsx`). */
  onShow: (prNumber: number) => void;
  onHide: () => void;
}>;

/**
 * One box of the queue (`queue-section.tsx`): the number, the priority on a
 * pill across the top edge as on the DAG's nodes, and a word on why it waits,
 * or what it is. One whose queue layer's checks are going has the running ring
 * as the running one does, and one whose are still to dispatch the queued dot:
 * those runs are what the worker is running meanwhile. A note naming only what
 * is not an open pull request, which it does not wait for, is struck out. The
 * title is in it for a screen reader, which the tooltip is hidden from.
 */
export const QueueSlotBox = ({ slot$, onShow, onHide }: Props): JSX.Element => (
  <ExternalLink
    href={slot$.pipe(map((slot) => slot.url))}
    variant={'queue-link'}
    onEnter={() => {
      onShow(Optional.unwrap(slot$.getSnapshot()).number);
    }}
    onLeave={onHide}
  >
    <If
      cond={slot$.pipe(map((slot) => slot.priority !== 'none'))}
      then={
        <span
          class={constant('queue-priority')}
          data-priority={slot$.pipe(map((slot) => slot.priority))}
        >
          {slot$.pipe(map((slot) => slot.priority))}
        </span>
      }
    />

    <span class={constant('queue-number')}>
      <If
        cond={slot$.pipe(map((slot) => slot.kind === 'running'))}
        then={<RunStateIcon kind={'running'} label={'running'} />}
      />
      <If
        cond={slot$.pipe(map((slot) => slot.layer?.standing === 'running'))}
        then={<RunStateIcon kind={'running'} label={'checks running ahead'} />}
      />
      <If
        cond={slot$.pipe(
          map(
            (slot) =>
              slot.layer?.standing === 'to-dispatch' ||
              slot.layer?.standing === 'waits',
          ),
        )}
        then={<RunStateIcon kind={'queued'} label={'checks to dispatch'} />}
      />
      {slot$.pipe(map((slot) => `#${slot.number}`))}
    </span>

    <If
      cond={slot$.pipe(map((slot) => slot.note !== undefined))}
      then={
        <span
          class={constant('queue-note')}
          data-settled={slot$.pipe(map((slot) => slot.noteSettled.toString()))}
        >
          {slot$.pipe(map((slot) => slot.note ?? ''))}
        </span>
      }
    />

    <span class={constant('visually-hidden')}>
      {slot$.pipe(
        map((slot) =>
          slot.detail === undefined
            ? ` ${slot.title}`
            : ` ${slot.title} — ${slot.detail}`,
        ),
      )}
    </span>
  </ExternalLink>
);
