import { MERGE_QUEUED_LABEL } from 'pr-report-core';
import { createState, map, type InitializedObservable } from 'synstate';
import {
  constant,
  derive,
  For,
  If,
  MatchOptional,
  view,
  type JSX,
} from 'synstate-dom';
import { Arr, Optional } from 'ts-data-forge';
import type { Entry } from '../load-report.mjs';
import { isUnread, OPEN_PARTS } from '../part-failures.mjs';
import type { QueueSlot, QueueView } from '../queue-view.mjs';
import { reader } from '../store/index.mjs';
import { ExternalLink } from './external-link.js';
import { PartFailureNotes } from './part-failure-notes.js';
import { QueueOutsideBox } from './queue-outside-box.js';
import { QueueSlotBox } from './queue-slot-box.js';
import { QueueTip, type QueueTipContent } from './queue-tip.js';
import { RunStateIcon } from './run-state-icon.js';

/**
 * `unblock-prs`'s queue, as one row of boxes under the merge order: the pull
 * request it is running at the head, by the base it merges into, then the ones
 * it would pick next in that order, then the ones whose turn has not come. What
 * is set aside, claimed or otherwise not the worker's to move is drawn outside
 * the row, on its own.
 *
 * Every box is the same width, however many there are, so the whole queue is
 * always in view; the number shrinks with the box. The title is in the tooltip,
 * and the rest of what is known about a pull request is in its card in the
 * merge order, so a box says only its number, its priority and a word on why it
 * waits.
 */
export const QueueSection = (): JSX.Element => {
  // `undefined` while what it is decided from is still being read.
  const queue = view(reader.queue, Optional.fromNullable);

  return (
    <section class={constant('section queue-section')}>
      <h2 class={constant('section-title')}>
        {constant('Queue')}
        <MatchOptional
          some={(queue$) => (
            <span
              class={constant('queue-counts')}
              title={constant(
                "In the order unblock-prs would pick them. A pull request one of its runs saw green without merging goes last there; that lives in the run's memory and is not shown here.",
              )}
            >
              {view(queue$, countsOf)}
            </span>
          )}
          value={queue}
        />
      </h2>

      <PartFailureNotes parts={OPEN_PARTS} />

      <MatchOptional
        none={<QueueUnordered />}
        some={(queue$) => <QueueBody queue$={queue$} />}
        value={queue}
      />
    </section>
  );
};

const queuedOf = (entries: readonly Entry[]): readonly Entry[] =>
  entries
    .filter(({ labels }) =>
      labels.some(({ name }) => name === MERGE_QUEUED_LABEL),
    )
    .toSorted((a, b) => a.number - b.number);

/**
 * The queue before its order is known: the pull requests labelled
 * `merge-queued`, which the pull requests' query reads, by number. The order
 * needs the checks, the comparisons and the details, which come later or, where
 * one failed, not on this read.
 */
const QueueUnordered = (): JSX.Element => {
  const queued = reader.entries.pipe(map(queuedOf));

  // Whether the parts the order needs may still come: a read is out, and none
  // of them has failed with nothing kept.
  const coming = derive(
    [reader.fetching, reader.failed],
    (isFetching, failed) =>
      isFetching && OPEN_PARTS.every((part) => !isUnread(failed, part)),
  );

  return (
    <>
      <If
        cond={coming}
        then={
          <p class={constant('section-note')}>{constant('Reading GitHub…')}</p>
        }
      />

      <If
        cond={view(queued, Arr.isNonEmpty)}
        then={
          <div class={constant('queue-unordered')}>
            <span class={constant('queue-unordered-label')}>
              {derive(
                [queued, coming],
                (entries, isComing) =>
                  `${entries.length} labelled merge-queued, order ${isComing ? 'not known yet' : 'not read'}`,
              )}
            </span>
            <ul class={constant('queue-unordered-list')}>
              <For items={queued} key={(entry) => entry.number}>
                {(entry$) => (
                  <li>
                    <ExternalLink
                      href={view(entry$, ({ url }) => url)}
                      title={view(
                        entry$,
                        ({ number, title }) => `#${number} ${title}`,
                      )}
                    >
                      {view(entry$, ({ number }) => `#${number}`)}
                    </ExternalLink>
                  </li>
                )}
              </For>
            </ul>
          </div>
        }
      />
    </>
  );
};

const QueueLegend = (): JSX.Element => (
  <ul class={constant('queue-legend')}>
    <li>
      <RunStateIcon kind={'running'} label={'running'} />
      <span aria-hidden={constant('true')}>{constant('running')}</span>
    </li>
    <li>
      <span class={constant('queue-swatch')} data-kind={constant('waiting')} />
      {constant('waits for another PR')}
    </li>
    <li>
      <span class={constant('queue-swatch')} data-kind={constant('outside')} />
      {constant('set aside')}
    </li>
    {(['high', 'mid', 'low'] as const).map((priority) => (
      <li>
        <span
          class={constant('queue-swatch')}
          data-kind={constant('priority')}
          data-priority={constant(priority)}
        />
        {constant(priority)}
      </li>
    ))}
  </ul>
);

const runningOf = (queue: QueueView): number =>
  queue.slots.filter(({ kind }) => kind === 'running').length;

const slotTipOf = (
  queue: QueueView,
  shown: number | undefined,
): Optional<QueueTipContent> => {
  const index = queue.slots.findIndex(({ number }) => number === shown);

  const slot = queue.slots[index];

  return slot === undefined
    ? Optional.none
    : Optional.some({
        number: slot.number,
        title: slot.title,
        detail: slot.detail,
        side: index < queue.slots.length / 2 ? 'start' : 'end',
      });
};

const outsideTipOf = (
  queue: QueueView,
  shown: number | undefined,
): Optional<QueueTipContent> => {
  const node = queue.outside.find(({ number }) => number === shown);

  return node === undefined
    ? Optional.none
    : Optional.some({
        number: node.number,
        title: node.title,
        detail: node.detail,
        side: 'start',
      });
};

/** What the label under a box says: `running`, `next`, then 2, 3 and on. */
const placeOf = (slot: QueueSlot, place: number): string =>
  slot.kind === 'running'
    ? 'running'
    : place === 0
      ? 'next'
      : (place + 1).toString();

const QueueBody = ({
  queue$,
}: Readonly<{ queue$: InitializedObservable<QueueView> }>): JSX.Element => {
  // The box pointed at or focused, by number. The page's one piece of state
  // that is not a store's: it lives as long as the block does.
  const [shown$, setShown] = createState<number | undefined>(undefined);

  const show = (prNumber: number): void => {
    setShown(prNumber);
  };

  const hide = (): void => {
    setShown(undefined);
  };

  const running$ = queue$.pipe(map(runningOf));

  return (
    <If
      cond={view(
        queue$,
        (queue) =>
          !Arr.isNonEmpty(queue.slots) && !Arr.isNonEmpty(queue.outside),
      )}
      else={
        <>
          <If
            cond={view(queue$, (queue) => Arr.isNonEmpty(queue.slots))}
            then={
              <div class={constant('queue-row')}>
                <span class={constant('queue-base')}>
                  {view(queue$, (queue) => queue.base)}
                  <span aria-hidden={constant('true')}>{constant(' ←')}</span>
                </span>

                <div class={constant('queue-track')}>
                  <ol class={constant('queue')}>
                    <For
                      items={view(queue$, (queue) => queue.slots)}
                      key={(slot) => slot.number}
                    >
                      {(slot$, index$) => (
                        <li
                          class={constant('queue-slot')}
                          data-kind={view(slot$, (slot) => slot.kind)}
                          data-priority={view(slot$, (slot) => slot.priority)}
                        >
                          <QueueSlotBox
                            slot$={slot$}
                            onHide={hide}
                            onShow={show}
                          />
                          <span class={constant('queue-place')}>
                            {derive(
                              [slot$, index$, running$],
                              (slot, index, running) =>
                                placeOf(slot, index - running),
                            )}
                          </span>
                        </li>
                      )}
                    </For>
                  </ol>

                  <MatchOptional
                    some={(tip$) => <QueueTip tip={tip$} />}
                    value={derive([queue$, shown$], slotTipOf)}
                  />
                </div>
              </div>
            }
          />

          <div class={constant('queue-foot')}>
            <If
              cond={view(queue$, (queue) => Arr.isNonEmpty(queue.outside))}
              then={
                <div class={constant('queue-outside')}>
                  <span class={constant('queue-outside-label')}>
                    {constant('set aside')}
                  </span>
                  <ul class={constant('queue-outside-list')}>
                    <For
                      items={view(queue$, (queue) => queue.outside)}
                      key={(node) => node.number}
                    >
                      {(node$) => (
                        <li class={constant('queue-outside-node')}>
                          <QueueOutsideBox
                            node$={node$}
                            onHide={hide}
                            onShow={show}
                          />
                        </li>
                      )}
                    </For>
                  </ul>
                </div>
              }
            />

            <QueueLegend />

            <MatchOptional
              some={(tip$) => <QueueTip tip={tip$} />}
              value={derive([queue$, shown$], outsideTipOf)}
            />
          </div>
        </>
      }
      then={
        <p class={constant('section-note')}>
          {constant('No open pull request is labelled merge-queued.')}
        </p>
      }
    />
  );
};

const countsOf = (queue: QueueView): string => {
  const running = runningOf(queue);

  return [
    `${queue.slots.length - running} queued`,
    `${running} running`,
    `${queue.outside.length} set aside`,
  ].join(' · ');
};
