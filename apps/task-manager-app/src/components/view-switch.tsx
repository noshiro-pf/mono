import { constant, view, type JSX } from 'synstate-dom';
import { uiStore } from '../store/index.mjs';
import type { View } from '../view-model/index.mjs';

/** The list or the DAG: two buttons, the pressed one is what is shown. */
export const ViewSwitch = (): JSX.Element => (
  <fieldset
    aria-label={constant('表示')}
    class={constant('bp6-button-group view-switch')}
  >
    {viewButton('list', 'リスト')}
    {viewButton('dag', 'DAG')}
  </fieldset>
);

const viewButton = (shows: View, label: string): JSX.Element => (
  <button
    aria-pressed={view(uiStore.view, (v) => String(v === shows))}
    class={{
      'bp6-button': constant(true),
      'bp6-active': view(uiStore.view, (v) => v === shows),
    }}
    data-e2e={constant(`view-${shows}`)}
    type={constant('button')}
    onClick={() => {
      uiStore.setView(shows);
    }}
  >
    {constant(label)}
  </button>
);
