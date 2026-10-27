import { constant, view, type JSX } from 'synstate-dom';
import { issuesViewStore } from '../store/index.mjs';

/**
 * Whether the DAG draws what is done: a switch shaped as the merge order's
 * priority chips are (`merge-order-filters.tsx`), pressed while it is drawn
 * and struck through while it is not, with how many nodes it covers. It
 * starts pressed, and the choice is kept across visits
 * (`issues-view-store.mts`).
 */
export const IssueDagDoneToggle = (): JSX.Element => (
  <button
    aria-pressed={view(issuesViewStore.hideDone, (hide) => (!hide).toString())}
    class={constant('filter-chip')}
    title={view(issuesViewStore.hideDone, (hide) =>
      hide
        ? 'Draw the issues closed as completed and the merged pull requests again'
        : 'Leave out the issues closed as completed and the merged pull requests, and the waits on them that are over',
    )}
    type={constant('button')}
    onClick={toggleHideDone}
  >
    {constant('Done')}
    <span class={constant('filter-chip-count')}>
      {issuesViewStore.doneCount}
    </span>
  </button>
);

const toggleHideDone = (): void => {
  issuesViewStore.toggleHideDone();
};
