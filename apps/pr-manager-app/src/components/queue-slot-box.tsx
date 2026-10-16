import { memoNamed } from 'preact-utils';
import { useCallback } from 'preact/hooks';
import type { QueueSlot } from '../queue-view.mjs';
import { ExternalLink } from './external-link.js';
import { RunStateIcon } from './run-state-icon.js';

type Props = Readonly<{
  slot: QueueSlot;
  /** Pointed at or focused: its tooltip is shown (`queue-tip.tsx`). */
  onShow: (prNumber: number) => void;
  onHide: () => void;
}>;

/**
 * One box of the queue (`queue-section.tsx`): the number, the priority on a
 * pill across the top edge as on the DAG's nodes, and a word on why it
 * waits, or what it is. The title is in it for a screen reader, which the
 * tooltip is hidden from.
 */
export const QueueSlotBox = memoNamed<Props>(
  'QueueSlotBox',
  ({ slot, onShow, onHide }) => {
    const show = useCallback((): void => {
      onShow(slot.number);
    }, [onShow, slot.number]);

    return (
      <ExternalLink
        href={slot.url}
        variant={'queue-link'}
        onEnter={show}
        onLeave={onHide}
      >
        {slot.priority === 'none' ? undefined : (
          <span className={'queue-priority'} data-priority={slot.priority}>
            {slot.priority}
          </span>
        )}

        <span className={'queue-number'}>
          {slot.kind === 'running' ? (
            <RunStateIcon kind={'running'} label={'running'} />
          ) : undefined}
          {`#${slot.number}`}
        </span>

        {slot.note === undefined ? undefined : (
          <span className={'queue-note'}>{slot.note}</span>
        )}

        <span className={'visually-hidden'}>
          {` ${slot.title}`}
          {slot.detail === undefined ? undefined : ` — ${slot.detail}`}
        </span>
      </ExternalLink>
    );
  },
);
