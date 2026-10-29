import { constant, view, type JSX } from 'synstate-dom';
import { m } from '../i18n/index.mjs';
import { uiStore } from '../store/index.mjs';
import type { View } from '../view-model/index.mjs';

/** The list or the DAG: two buttons, the pressed one is what is shown. */
export const ViewSwitch = (): JSX.Element => (
  <fieldset
    aria-label={constant(m.views.label)}
    class={constant('bp6-button-group view-switch')}
  >
    {viewButton('list', m.views.list)}
    {viewButton('dag', m.views.dag)}
  </fieldset>
);

const viewButton = (shows: View, label: string): JSX.Element => (
  <button
    aria-pressed={view(uiStore.view, (v) => (v === shows).toString())}
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
