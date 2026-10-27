import { constant, view, type JSX } from 'synstate-dom';
import { listSettingsStore } from '../store/index.mjs';
import { SortEditor } from './sort-editor.js';

/**
 * Whether done tasks are shown, and the sort keys — behind a disclosure, so
 * they take no room on a phone until asked for.
 */
export const ListToolbar = (): JSX.Element => (
  <div class={constant('list-toolbar')}>
    <label class={constant('bp6-control bp6-switch toolbar-switch')}>
      <input
        checked={view(listSettingsStore.settings, ({ hideDone }) => hideDone)}
        class={constant('bp6-control-input')}
        data-e2e={constant('hide-done')}
        type={constant('checkbox')}
        onChange={(changed) => {
          listSettingsStore.setHideDone(changed.currentTarget.checked);
        }}
      />
      <span class={constant('bp6-control-indicator')} />
      {constant('完了を隠す')}
    </label>
    <details class={constant('sort-details')}>
      <summary class={constant('bp6-button sort-summary')}>
        {constant('並べ替え')}
      </summary>
      <SortEditor
        actions={listSettingsStore}
        data-e2e={'list-sort-editor'}
        emptyNote={'並べ替えのキーはありません。'}
        label={'並べ替えのキー'}
        sort={view(listSettingsStore.settings, ({ sort }) => sort)}
      />
    </details>
  </div>
);
