import { memoNamed } from 'preact-utils';
import { issuesViewSignals, issuesViewStore } from '../store/index.mjs';

/**
 * Whether the DAG draws what is done: a switch shaped as the merge order's
 * priority chips are (`merge-order-filters.tsx`), pressed while it is drawn
 * and struck through while it is not, with how many nodes it covers. It
 * starts pressed, and the choice is kept across visits
 * (`issues-view-store.mts`).
 */
export const IssueDagDoneToggle = memoNamed('IssueDagDoneToggle', () => {
  const hideDone = issuesViewSignals.hideDone.value;

  const doneCount = issuesViewSignals.doneCount.value;

  return (
    <button
      aria-pressed={!hideDone}
      className={'filter-chip'}
      title={
        hideDone
          ? 'Draw the issues closed as completed and the merged pull requests again'
          : 'Leave out the issues closed as completed and the merged pull requests, and the waits on them that are over'
      }
      type={'button'}
      onClick={toggleHideDone}
    >
      {'Done'}
      <span className={'filter-chip-count'}>{doneCount}</span>
    </button>
  );
});

// Outside the component, so that the button is handed the same function on
// every render.

const toggleHideDone = (): void => {
  issuesViewStore.toggleHideDone();
};
