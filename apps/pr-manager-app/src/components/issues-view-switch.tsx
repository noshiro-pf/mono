import { memoNamed } from 'preact-utils';
import {
  issuesViewSignals,
  issuesViewStore,
  type IssuesView,
} from '../store/index.mjs';

/**
 * The list or the DAG: two buttons side by side, the pressed one
 * (`aria-pressed`) being what the block shows — the theme switch's
 * segmented control (`theme-switch.tsx`), for the same reasons.
 */
export const IssuesViewSwitch = memoNamed('IssuesViewSwitch', () => {
  const view = issuesViewSignals.view.value;

  return (
    <fieldset aria-label={'Show the issues as'} className={'view-switch'}>
      <button
        aria-pressed={view === 'list'}
        className={'view-switch-option'}
        title={'The open issues, most recently updated first'}
        type={'button'}
        onClick={showList}
      >
        {'List'}
      </button>

      <button
        aria-pressed={view === 'dag'}
        className={'view-switch-option'}
        title={'What each open issue waits for, from its Start-After: lines'}
        type={'button'}
        onClick={showDag}
      >
        {'DAG'}
      </button>
    </fieldset>
  );
});

// Outside the component, since neither reads its props.

const choose = (view: IssuesView) => (): void => {
  issuesViewStore.choose(view);
};

const showList = choose('list');

const showDag = choose('dag');
