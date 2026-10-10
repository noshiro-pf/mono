import { memoNamed } from 'preact-utils';
import { uiStore, viewSignal } from '../store/index.mjs';

/** The list or the DAG: two buttons, the pressed one is what is shown. */
export const ViewSwitch = memoNamed('ViewSwitch', () => {
  const view = viewSignal.value;

  return (
    <fieldset aria-label={'表示'} className={'bp6-button-group view-switch'}>
      <button
        aria-pressed={view === 'list'}
        className={`bp6-button ${view === 'list' ? 'bp6-active' : ''}`}
        data-e2e={'view-list'}
        type={'button'}
        onClick={showList}
      >
        {'リスト'}
      </button>
      <button
        aria-pressed={view === 'dag'}
        className={`bp6-button ${view === 'dag' ? 'bp6-active' : ''}`}
        data-e2e={'view-dag'}
        type={'button'}
        onClick={showDag}
      >
        {'DAG'}
      </button>
    </fieldset>
  );
});

const showList = (): void => {
  uiStore.setView('list');
};

const showDag = (): void => {
  uiStore.setView('dag');
};
