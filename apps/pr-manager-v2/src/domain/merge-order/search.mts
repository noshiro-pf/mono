import { PullRequestLabel } from 'pr-report-core-v2';
import { Arr } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import { anyLabelQualifier, notLabelQualifier } from '../github-search.mjs';
import { LABELLED_PRIORITIES } from './card.mjs';
import {
  STATUS_NAMES,
  type MergeOrderSettings,
  type MergeOrderStatus,
} from './view.mjs';

/** The merge order's filters as a GitHub search, as far as one can say them. */
export type MergeOrderSearch = Readonly<{
  query: string;
  /** Statuses hidden that the search cannot leave out: GitHub lists them. */
  unhidden: readonly MergeOrderStatus[];
  /** The status picked, when the search cannot pick it: GitHub lists the rest. */
  unpicked: readonly MergeOrderStatus[];
}>;

/**
 * The closest search GitHub has for what the merge order shows (spec §7.3).
 *
 * `queued` and `pending` are labels, and so are the priorities: one hidden is
 * `-label:`. `failing`, `set aside` and `awaiting code owner` are the page's own
 * reading of the checks, the worker's comments and the rules (`status:` and
 * `review:` read GitHub's, which say something else), so hiding one leaves it
 * in and picking one picks nothing. Hiding `none` asks for one of the priority
 * labels; a pull request with several, which the page counts as `none`, is
 * where the two can still differ. GitHub has no merge order: this is the set.
 */
export const mergeOrderSearchOf = (
  settings: MergeOrderSettings,
): MergeOrderSearch => {
  const picked =
    settings.only === undefined ? undefined : STATUS_LABELS[settings.only];

  const hiddenPriorities = LABELLED_PRIORITIES.filter((priority) =>
    settings.hidePriority.includes(priority),
  );

  return {
    query: [
      'is:pr is:open',
      ...Arr.generate(function* () {
        for (const status of settings.hide) {
          const name = STATUS_LABELS[status];

          if (name !== undefined) {
            yield notLabelQualifier(name);
          }
        }
      }),
      ...(picked === undefined ? [] : [anyLabelQualifier([picked])]),
      ...hiddenPriorities.map((priority) =>
        notLabelQualifier(`priority:${priority}`),
      ),
      ...(settings.hidePriority.includes('none')
        ? [
            anyLabelQualifier(
              LABELLED_PRIORITIES.map((priority) => `priority:${priority}`),
            ),
          ]
        : []),
      ...(settings.hideDrafts ? ['draft:false'] : []),
    ].join(' '),
    unhidden: settings.hide.filter(
      (status) => STATUS_LABELS[status] === undefined,
    ),
    unpicked:
      picked === undefined && settings.only !== undefined
        ? [settings.only]
        : [],
  };
};

/** The "on GitHub" link's tooltip: where GitHub lists more than the page. */
export const mergeOrderSearchTitle = ({
  unhidden,
  unpicked,
}: MergeOrderSearch): string =>
  [
    'The open pull requests as the filters leave them, in no merge order.',
    ...(Arr.isNonEmpty(unhidden)
      ? [
          `GitHub’s search cannot leave out ${namesOf(unhidden)}, so it lists those too.`,
        ]
      : []),
    ...(Arr.isNonEmpty(unpicked)
      ? [
          `GitHub’s search cannot pick ${namesOf(unpicked)}, so it lists the rest too.`,
        ]
      : []),
  ].join(' ');

const STATUS_LABELS = {
  queued: PullRequestLabel.mergeQueued,
  pending: PullRequestLabel.pending,
  failing: undefined,
  setAside: undefined,
  codeOwner: undefined,
} as const satisfies ReadonlyRecord<MergeOrderStatus, string | undefined>;

const namesOf = (statuses: readonly MergeOrderStatus[]): string =>
  statuses.map((status) => STATUS_NAMES[status]).join(' and ');
