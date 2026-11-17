import type { PaneButton, PaneButtonOutcome } from 'split-view-link';
import type { ReadonlyRecord } from 'ts-type-forge';
import type { AddLabelResult } from './label-picker.mjs';

/**
 * The merge-queued button: what it says, before, during and after a press, in a
 * tab (`pull-request-buttons.mts`) and in a pane of Split View
 * (`background.mts`, through the pane bridge).
 *
 * The label is the one in `libs/pr-report-core/src/labels.mts` and the
 * workflows; it is written out rather than imported because this is a browser
 * extension, built into self-contained files, and that package is the queue's
 * Node tooling.
 */
export const mergeQueuedLabel = 'merge-queued';

export const queueIdleText = `＋ ${mergeQueuedLabel}` as const;

export const queueBusyText = `… ${mergeQueuedLabel}` as const;

/**
 * What the button shows afterwards: what adding the label came to, or, in a
 * tab, that the conversation tab is being loaded as a new document.
 */
export type QueueResult = AddLabelResult | 'reloading';

export const queueResultText = {
  labelled: `✓ ${mergeQueuedLabel}`,
  'already-labelled': `✓ already ${mergeQueuedLabel}`,
  'no-picker': '✕ no label picker here',
  'no-such-label': `✕ no "${mergeQueuedLabel}" label`,
  'not-saved': '✕ not saved',
  'left-page': '✕ left the pull request',
  reloading: '→ conversation; press again there',
} as const satisfies ReadonlyRecord<QueueResult, string>;

/** Whether a result is shown as a success. */
export const isQueueSuccess = (result: QueueResult): boolean =>
  result === 'labelled' || result === 'already-labelled';

/** The merge-queued button in a pane, as the pane bridge describes it. */
export const mergeQueuedPaneButton: PaneButton = {
  id: mergeQueuedLabel,
  label: queueIdleText,
  busyLabel: queueBusyText,
  title: [
    `Add the "${mergeQueuedLabel}" label to this pull request,`,
    "through the sidebar's label picker, as you.",
  ].join('\n'),
} as const;

/** What a press in a pane came to, for the pane bridge. */
export const paneOutcomeOf = (result: AddLabelResult): PaneButtonOutcome =>
  ({
    label: queueResultText[result],
    tone: isQueueSuccess(result) ? ('success' as const) : ('failure' as const),
  }) as const;
