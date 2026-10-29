import { constant, type JSX } from 'synstate-dom';
import { m } from '../i18n/index.mjs';
import { dagShowDoneStore } from '../store/index.mjs';

/**
 * Whether the done tasks and the reached milestones are drawn, in every view
 * mode: off unless turned on, and then they and the edges from them are left
 * out (`dag/hidden-nodes.mts`). Kept on this device, apart from the list's
 * 「完了を隠す」.
 */
export const DagShowDoneField = (): JSX.Element => (
  <div class={constant('settings-field')}>
    <label class={constant('bp6-control bp6-switch settings-switch')}>
      <input
        aria-describedby={constant(HINT_ID)}
        checked={dagShowDoneStore.showDone}
        class={constant('bp6-control-input')}
        data-e2e={constant('dag-show-done')}
        type={constant('checkbox')}
        onChange={(changed) => {
          dagShowDoneStore.set(changed.currentTarget.checked);
        }}
      />
      <span class={constant('bp6-control-indicator')} />
      {constant(m.settings.showDone)}
    </label>
    <p class={constant('settings-hint')} id={constant(HINT_ID)}>
      {constant(m.settings.showDoneHint)}
    </p>
  </div>
);

const HINT_ID = 'dag-show-done-hint';
