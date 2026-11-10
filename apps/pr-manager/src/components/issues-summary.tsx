import { map } from 'synstate';
import {
  constant,
  deriveBindable,
  If,
  mapBindable,
  type Bindable,
  type JSX,
} from 'synstate-dom';
import type { IssueFilterCounts } from '../issues-list-view.mjs';
import { issuesListStore, issuesViewStore } from '../store/index.mjs';
import { IssueTierGroup } from './issue-tier-group.js';
import { StatTile, StatToggle } from './stat-tile.js';

/**
 * What the open issues lead with, in either view: how many are shown of how
 * many are open, `in progress` and the tiers, each a switch for the issues it
 * counts with an `only` switch in its corner — the merge order's counts
 * (`merge-order-filters.tsx`), for issues. What a switch does is
 * `issues-list-view.mts`, which keeps the choice in the URL; the list and the
 * DAG show the same issues. An issue held back is one of the `hold` tier
 * (`docs/issue-priority.md`), so being held back has no switch apart from that
 * tier's.
 *
 * The tiers are one control, since they are one question asked of every issue,
 * which has exactly one of them: picking two shows either. `in progress` stands
 * apart, as another question: picked with a tier, it shows what is both
 * (`issue-filter.mts`). Once a tier is picked, the tiers neither picked nor
 * hidden fade, and `in progress` does not, since it is not it that decides
 * them.
 *
 * The tiers are drawn as two groups of joined tiles (`issue-tier-group.tsx`):
 * `S` to `D` and `none` on a row of their own, and `hold` and `close` beside
 * `open` and `in progress`. A tier's tooltip says what the tier means, and its
 * `only`'s what picking it does.
 *
 * `open` is how many issues the view shown draws for their own sake — the list,
 * after its own switches and the search too (`countIssues`), or the
 * DAG (`issues-view-store.mts`), which also draws an issue left out that one
 * drawn waits on and does not count it. Each tier is how many of it showing it
 * would draw, and so is `in progress`. Beside each, in small, how many there
 * are in all when that is more. A tier is pressed while its issues are shown:
 * one neither hidden nor picked while another is picked is not, and pressing it
 * picks it too. `in progress` is there while an open issue is under way, or
 * while it is switched off or picked, so that it can be undone.
 */
export const IssuesSummary = (): JSX.Element => {
  const counts$ = shownCounts();

  const view$ = issuesListStore.view;

  return (
    <div class={constant('issues-summary-box')}>
      {/* eslint-disable-next-line synstate-dom-a11y/prefer-tag-over-role -- recorded, not fixed, when jsx-a11y came to synstate-dom (#3764) */}
      <div
        aria-label={constant('Open issues by priority and in progress')}
        class={constant('summary-row issues-summary')}
        role={constant('group')}
      >
        <StatTile
          label={'open'}
          total={mapBindable(counts$, ({ open }) => open.total)}
          value={mapBindable(counts$, ({ open }) => open.shown)}
        />
        <If
          cond={deriveBindable(
            [counts$, view$],
            ({ inProgress }, { hideInProgress, onlyInProgress }) =>
              inProgress.total > 0 || hideInProgress || onlyInProgress,
          )}
          then={
            <StatToggle
              label={'in progress'}
              only={view$.pipe(map(({ onlyInProgress }) => onlyInProgress))}
              pickWith={'both'}
              pressed={view$.pipe(map(({ hideInProgress }) => !hideInProgress))}
              subject={
                'the issues in progress: those that can start, and that an open pull request closes or that are labelled in-progress'
              }
              total={mapBindable(counts$, ({ inProgress }) => inProgress.total)}
              value={mapBindable(counts$, ({ inProgress }) => inProgress.shown)}
              onOnly={toggleInProgressOnly}
              onToggle={toggleInProgress}
            />
          }
        />
        <IssueTierGroup counts$={counts$} row={'aside'} />
        <IssueTierGroup counts$={counts$} row={'ranked'} />
      </div>
    </div>
  );
};

/** The counts of the view shown, the list's or the DAG's. */
const shownCounts = (): Bindable<IssueFilterCounts> =>
  deriveBindable(
    [issuesViewStore.view, issuesListStore.counts, issuesViewStore.counts],
    (shown, list, dag) => (shown === 'dag' ? dag : list),
  );

const toggleInProgress = (): void => {
  issuesListStore.toggleInProgress();
};

const toggleInProgressOnly = (): void => {
  issuesListStore.toggleInProgressOnly();
};
