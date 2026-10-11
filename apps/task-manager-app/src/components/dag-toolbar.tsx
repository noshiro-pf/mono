import type { RefObject } from 'preact';
import { memoNamed } from 'preact-utils';
import {
  dagArrangementSignal,
  dagLayoutStore,
  dagViewModeSignal,
} from '../store/index.mjs';
import { isArrangeable } from '../view-model/index.mjs';
import { DagSettingsButton } from './dag-settings-button.js';
import { DagViewModeSwitch } from './dag-view-mode-switch.js';

type Props = Readonly<{
  /** Read by the canvas, which keeps 「アーク」 and 「タイル」 clear of it. */
  toolbarRef: RefObject<HTMLDivElement>;
}>;

/**
 * First, the view mode. Then, in the mode the reader arranges (「DAG」),
 * which way the graph grows — the side edges leave and enter nodes by, and
 * the direction 「自動整列」 lays it out in — and 「自動整列」 itself, which
 * puts every node back where ELK does. Choosing the direction moves nothing.
 * At the right end, 「表示設定」, which opens the settings that apply to
 * every mode (`dag-settings-panel.tsx`). One row at 390px in every mode
 * (`index.css`).
 */
export const DagToolbar = memoNamed<Props>('DagToolbar', (props) => {
  const { toolbarRef } = props;

  const { direction } = dagArrangementSignal.value;

  const arrangeable = isArrangeable(dagViewModeSignal.value);

  return (
    <div ref={toolbarRef} className={'dag-toolbar'} data-e2e={'dag-toolbar'}>
      <DagViewModeSwitch />
      {arrangeable ? (
        <>
          <fieldset aria-label={'伸ばす向き'} className={'bp6-button-group'}>
            <button
              aria-pressed={direction === 'right'}
              className={`bp6-button ${direction === 'right' ? 'bp6-active' : ''}`}
              data-e2e={'dag-direction-right'}
              type={'button'}
              onClick={growRight}
            >
              {'右へ'}
            </button>
            <button
              aria-pressed={direction === 'down'}
              className={`bp6-button ${direction === 'down' ? 'bp6-active' : ''}`}
              data-e2e={'dag-direction-down'}
              type={'button'}
              onClick={growDown}
            >
              {'下へ'}
            </button>
          </fieldset>
          <button
            className={'bp6-button'}
            data-e2e={'dag-arrange'}
            type={'button'}
            onClick={dagLayoutStore.autoArrange}
          >
            {'自動整列'}
          </button>
        </>
      ) : undefined}
      <DagSettingsButton />
    </div>
  );
});

const growRight = (): void => {
  dagLayoutStore.setDirection('right');
};

const growDown = (): void => {
  dagLayoutStore.setDirection('down');
};
