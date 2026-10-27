import { constant, view, type JSX } from 'synstate-dom';
import { issuesViewStore } from '../store/index.mjs';

/**
 * Whether the DAG draws what is labelled `pending`: a switch beside the one
 * for what is done (`issue-dag-done-toggle.tsx`), shaped and kept as that
 * one is, with how many nodes it covers. Drawn, a pending node is faint, as
 * a low priority one is (`issue-dag-node.tsx`).
 */
export const IssueDagPendingToggle = (): JSX.Element => (
  <button
    aria-pressed={view(issuesViewStore.hidePending, (hide) =>
      (!hide).toString(),
    )}
    class={constant('filter-chip')}
    title={view(issuesViewStore.hidePending, (hide) =>
      hide
        ? 'Draw the issues and pull requests labelled pending again'
        : 'Leave out the issues and pull requests labelled pending, and the waits on them',
    )}
    type={constant('button')}
    onClick={toggleHidePending}
  >
    {constant('Pending')}
    <span class={constant('filter-chip-count')}>
      {issuesViewStore.pendingCount}
    </span>
  </button>
);

const toggleHidePending = (): void => {
  issuesViewStore.toggleHidePending();
};
