import { constant, If, view, type JSX } from 'synstate-dom';
import type { DagDirection } from '../dag/index.mjs';
import { m } from '../i18n/index.mjs';
import { dagLayoutStore, dagViewModeStore } from '../store/index.mjs';
import { isArrangeable } from '../view-model/index.mjs';
import { DagSettingsButton } from './dag-settings-button.js';
import { DagViewModeSwitch } from './dag-view-mode-switch.js';

type Props = Readonly<{
  /** Called with the toolbar, which the canvas keeps clear of. */
  toolbarRef: (element: HTMLDivElement) => void;
}>;

/**
 * First, the view mode. Then, in the mode the reader arranges (「DAG」),
 * which way the graph grows — the side edges leave and enter nodes by, and
 * the direction 「自動整列」 lays it out in — and 「自動整列」 itself, which
 * puts every node back where ELK does, and lays the graph out again as it
 * changes until a node is moved (`dag-layout-store.mts`). A button rather than
 * a switch: whether the DAG is so laid out is read from where the nodes are,
 * and a drag is what turns it off. Choosing the direction moves nothing.
 * At the right end, 「表示設定」, which opens the settings that apply to
 * every mode (`dag-settings-panel.tsx`). One row at 390px in every mode
 * (`index.css`).
 */
export const DagToolbar = ({ toolbarRef }: Props): JSX.Element => (
  <div
    ref={toolbarRef}
    class={constant('dag-toolbar')}
    data-e2e={constant('dag-toolbar')}
  >
    <DagViewModeSwitch />
    <If
      cond={view(dagViewModeStore.mode, isArrangeable)}
      then={
        <>
          <fieldset
            aria-label={constant(m.dag.direction)}
            class={constant('bp6-button-group')}
          >
            {directionButton('right', m.dag.right)}
            {directionButton('down', m.dag.down)}
          </fieldset>
          <button
            class={constant('bp6-button')}
            data-e2e={constant('dag-arrange')}
            type={constant('button')}
            onClick={dagLayoutStore.autoArrange}
          >
            {constant(m.dag.arrange)}
          </button>
        </>
      }
    />
    <DagSettingsButton />
  </div>
);

const directionButton = (
  direction: DagDirection,
  label: string,
): JSX.Element => {
  const pressed = view(
    dagLayoutStore.arrangement,
    (arrangement) => arrangement.direction === direction,
  );

  return (
    <button
      aria-pressed={view(dagLayoutStore.arrangement, (arrangement) =>
        (arrangement.direction === direction).toString(),
      )}
      class={{ 'bp6-button': constant(true), 'bp6-active': pressed }}
      data-e2e={constant(`dag-direction-${direction}`)}
      type={constant('button')}
      onClick={() => {
        dagLayoutStore.setDirection(direction);
      }}
    >
      {constant(label)}
    </button>
  );
};
