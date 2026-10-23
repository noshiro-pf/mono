import { constant, view, type JSX, type View } from 'synstate-dom';
import { issuesViewStore, type IssuesView } from '../store/index.mjs';

/**
 * The list or the DAG: two buttons side by side, the pressed one
 * (`aria-pressed`) being what the block shows — the theme switch's
 * segmented control (`theme-switch.tsx`), for the same reasons.
 */
export const IssuesViewSwitch = (): JSX.Element => (
  <fieldset
    aria-label={constant('Show the issues as')}
    class={constant('view-switch')}
  >
    <button
      aria-pressed={pressedFor('list')}
      class={constant('view-switch-option')}
      title={constant('The open issues, most recently updated first')}
      type={constant('button')}
      onClick={showList}
    >
      {constant('List')}
    </button>

    <button
      aria-pressed={pressedFor('dag')}
      class={constant('view-switch-option')}
      title={constant(
        'What each open issue waits for, from its Start-After: lines',
      )}
      type={constant('button')}
      onClick={showDag}
    >
      {constant('DAG')}
    </button>
  </fieldset>
);

const pressedFor = (shown: IssuesView): View<string> =>
  view(issuesViewStore.view, (current) => String(current === shown));

const choose = (shown: IssuesView) => (): void => {
  issuesViewStore.choose(shown);
};

const showList = choose('list');

const showDag = choose('dag');
