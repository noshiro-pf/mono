import { memoNamed } from 'preact-utils';
import { useCallback, useState } from 'preact/hooks';
import { Arr } from 'ts-data-forge';
import type { QueueSlot, QueueView } from '../queue-view.mjs';
import { QueueOutsideBox } from './queue-outside-box.js';
import { QueueSlotBox } from './queue-slot-box.js';
import { QueueTip } from './queue-tip.js';
import { RunStateIcon } from './run-state-icon.js';

type Props = Readonly<{
  /** `undefined` while what it is decided from is still being read. */
  queue: QueueView | undefined;
}>;

/**
 * `unblock-prs`'s queue, as one row of boxes under the merge order: the pull
 * request it is running at the head, by the base it merges into, then the
 * ones it would pick next in that order, then the ones whose turn has not
 * come. What is set aside, claimed or otherwise not the worker's to move is
 * drawn outside the row, on its own.
 *
 * Every box is the same width, however many there are, so the whole queue
 * is always in view; the number shrinks with the box. The title is in the
 * tooltip, and the rest of what is known about a pull request is in its
 * card in the merge order, so a box says only its number, its priority and
 * a word on why it waits.
 */
export const QueueSection = memoNamed<Props>('QueueSection', ({ queue }) => {
  // The box pointed at or focused, by number.
  const [shown, setShown] = useState<number | undefined>(undefined);

  const show = useCallback((prNumber: number): void => {
    setShown(prNumber);
  }, []);

  const hide = useCallback((): void => {
    setShown(undefined);
  }, []);

  const running =
    queue?.slots.filter(({ kind }) => kind === 'running').length ?? 0;

  const queued = (queue?.slots.length ?? 0) - running;

  const shownIndex =
    queue?.slots.findIndex(({ number }) => number === shown) ?? -1;

  const shownSlot = queue?.slots[shownIndex];

  const shownOutside = queue?.outside.find(({ number }) => number === shown);

  return (
    <section className={'section queue-section'}>
      <h2 className={'section-title'}>
        {'Queue'}
        {queue === undefined ? undefined : (
          <span
            className={'queue-counts'}
            title={
              "In the order unblock-prs would pick them. A pull request one of its runs saw green without merging goes last there; that lives in the run's memory and is not shown here."
            }
          >
            {[
              `${queued} queued`,
              `${running} running`,
              `${queue.outside.length} set aside`,
            ].join(' · ')}
          </span>
        )}
      </h2>

      {queue === undefined ? (
        <p className={'section-note'}>{'Reading GitHub…'}</p>
      ) : !Arr.isNonEmpty(queue.slots) && !Arr.isNonEmpty(queue.outside) ? (
        <p className={'section-note'}>
          {'No open pull request is labelled merge-queued.'}
        </p>
      ) : (
        <>
          {Arr.isNonEmpty(queue.slots) ? (
            <div className={'queue-row'}>
              <span className={'queue-base'}>
                {queue.base}
                <span aria-hidden={'true'}>{' ←'}</span>
              </span>

              <div className={'queue-track'}>
                <ol className={'queue'}>
                  {queue.slots.map((slot, index) => (
                    <li
                      key={slot.number}
                      className={'queue-slot'}
                      data-kind={slot.kind}
                      data-priority={slot.priority}
                    >
                      <QueueSlotBox slot={slot} onHide={hide} onShow={show} />
                      <span className={'queue-place'}>
                        {placeOf(slot, index - running)}
                      </span>
                    </li>
                  ))}
                </ol>

                {shownSlot === undefined ? undefined : (
                  <QueueTip
                    detail={shownSlot.detail}
                    number={shownSlot.number}
                    side={shownIndex < queue.slots.length / 2 ? 'start' : 'end'}
                    title={shownSlot.title}
                  />
                )}
              </div>
            </div>
          ) : undefined}

          <div className={'queue-foot'}>
            {Arr.isNonEmpty(queue.outside) ? (
              <div className={'queue-outside'}>
                <span className={'queue-outside-label'}>{'set aside'}</span>
                <ul className={'queue-outside-list'}>
                  {queue.outside.map((node) => (
                    <li key={node.number} className={'queue-outside-node'}>
                      <QueueOutsideBox
                        node={node}
                        onHide={hide}
                        onShow={show}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ) : undefined}

            <ul className={'queue-legend'}>
              <li>
                <RunStateIcon kind={'running'} label={'running'} />
                <span aria-hidden={'true'}>{'running'}</span>
              </li>
              <li>
                <span className={'queue-swatch'} data-kind={'waiting'} />
                {'waits for another PR'}
              </li>
              <li>
                <span className={'queue-swatch'} data-kind={'outside'} />
                {'set aside'}
              </li>
              {(['high', 'mid', 'low'] as const).map((priority) => (
                <li key={priority}>
                  <span
                    className={'queue-swatch'}
                    data-kind={'priority'}
                    data-priority={priority}
                  />
                  {priority}
                </li>
              ))}
            </ul>

            {shownOutside === undefined ? undefined : (
              <QueueTip
                detail={shownOutside.detail}
                number={shownOutside.number}
                side={'start'}
                title={shownOutside.title}
              />
            )}
          </div>
        </>
      )}
    </section>
  );
});

/** What the label under a box says: `running`, `next`, then 2, 3 and on. */
const placeOf = (slot: QueueSlot, place: number): string =>
  slot.kind === 'running'
    ? 'running'
    : place === 0
      ? 'next'
      : String(place + 1);
