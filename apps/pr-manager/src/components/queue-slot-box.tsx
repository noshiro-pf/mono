import { type InitializedObservable, map } from 'synstate';
import { constant, If, inlineMap, type JSX } from 'synstate-dom';
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
 * or what it is. The title is in it for a screen reader, which the tooltip is
 * hidden from.
 */
export const QueueSlotBox = ({ slot$, onShow, onHide }: Props): JSX.Element => (
  <ExternalLink
    href={slot$.pipe(map((slot) => slot.url))}
    variant={'queue-link'}
    onEnter={() => {
      onShow(slot$.getSnapshot().value.number);
    }}
    onLeave={onHide}
  >
    <If
      cond={slot$.pipe(map((slot) => slot.priority !== 'none'))}
      then={
        <span
          class={constant('queue-priority')}
          data-priority={inlineMap(slot$, (slot) => slot.priority)}
        >
          {inlineMap(slot$, (slot) => slot.priority)}
        </span>
      }
    />

    <span class={constant('queue-number')}>
      <If
        cond={slot$.pipe(map((slot) => slot.kind === 'running'))}
        then={<RunStateIcon kind={'running'} label={'running'} />}
      />
      {inlineMap(slot$, (slot) => `#${slot.number}`)}
    </span>

    <If
      cond={slot$.pipe(map((slot) => slot.note !== undefined))}
      then={
        <span class={constant('queue-note')}>
          {inlineMap(slot$, (slot) => slot.note ?? '')}
        </span>
      }
    />

    <span class={constant('visually-hidden')}>
      {inlineMap(slot$, (slot) =>
        slot.detail === undefined
          ? ` ${slot.title}`
          : ` ${slot.title} — ${slot.detail}`,
      )}
    </span>
  </ExternalLink>
);
