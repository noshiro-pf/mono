import { Icon } from 'blueprint-synstate';
import { constant, If, view, type JSX } from 'synstate-dom';
import { m } from '../i18n/index.mjs';
import { dagFilterStore, narrowStore, uiStore } from '../store/index.mjs';
import {
  isDagFilterEmpty,
  settingsPanelPlacement,
  type SettingsPanelPlacement,
} from '../view-model/index.mjs';

/**
 * 「表示設定」, at the right end of the graph screen's toolbar: opens the
 * panel of the settings that apply to every view mode
 * (`dag-settings-panel.tsx`), which gives the focus back to it on closing.
 * A gear, and its name beside it where there is room; on a narrow screen the
 * name is for assistive technology alone (`index.css`). While the graph is
 * filtered (`dag-filter-field.tsx`), a dot on it says so, since nothing else on
 * the screen does.
 */
export const DagSettingsButton = (): JSX.Element => (
  <button
    aria-expanded={view(uiStore.settingsPanel, (placement) =>
      (placement !== undefined).toString(),
    )}
    aria-haspopup={constant('dialog')}
    class={constant('bp6-button dag-settings-button')}
    data-e2e={constant('dag-settings')}
    id={constant(DAG_SETTINGS_BUTTON_ID)}
    type={constant('button')}
    onClick={() => {
      uiStore.openSettings(currentSettingsPlacement());
    }}
  >
    <Icon icon={'cog'} />
    <span class={constant('dag-settings-button-text')}>
      {constant(m.settings.title)}
    </span>
    <If
      cond={view(dagFilterStore.filter, (filter) => !isDagFilterEmpty(filter))}
      then={
        <span
          class={constant('dag-settings-filtered')}
          data-e2e={constant('dag-filtered')}
          title={constant(m.settings.filtering)}
        >
          <span class={constant('visually-hidden')}>
            {constant(m.settings.filteringSuffix)}
          </span>
        </span>
      }
    />
  </button>
);

/** For the panel, to hang from it and to give the focus back to it. */
export const DAG_SETTINGS_BUTTON_ID = 'dag-settings-button';

/**
 * Where the panel opens now, from where the button is and how wide the screen
 * is (`view-model/settings-panel.mts`).
 */
export const currentSettingsPlacement = (): SettingsPanelPlacement => {
  const page = document.documentElement;

  const anchor = document
    .querySelector(`#${DAG_SETTINGS_BUTTON_ID}`)
    ?.getBoundingClientRect();

  return settingsPanelPlacement(
    anchor ?? { bottom: 0, right: page.clientWidth },
    { width: page.clientWidth, height: page.clientHeight },
    narrowStore.matches.getSnapshot().value,
  );
};
