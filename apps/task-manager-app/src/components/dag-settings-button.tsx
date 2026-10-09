import { memoNamed } from 'preact-utils';
import { narrowStore, settingsPanelSignal, uiStore } from '../store/index.mjs';
import {
  settingsPanelPlacement,
  type SettingsPanelPlacement,
} from '../view-model/index.mjs';

/**
 * 「表示設定」, at the right end of the graph screen's toolbar: opens the
 * panel of the settings that apply to every view mode
 * (`dag-settings-panel.tsx`), which gives the focus back to it on closing.
 * A gear, and its name beside it where there is room; on a narrow screen
 * the name is for assistive technology alone (`index.css`).
 */
export const DagSettingsButton = memoNamed('DagSettingsButton', () => (
  <button
    aria-expanded={settingsPanelSignal.value !== undefined}
    aria-haspopup={'dialog'}
    className={'bp6-button dag-settings-button'}
    data-e2e={'dag-settings'}
    id={DAG_SETTINGS_BUTTON_ID}
    type={'button'}
    onClick={openSettings}
  >
    <span aria-hidden className={'bp6-icon bp6-icon-cog'}>
      <svg data-icon={'cog'} height={16} viewBox={'0 0 16 16'} width={16}>
        <path d={COG_16} fillRule={'evenodd'} />
      </svg>
    </span>
    <span className={'dag-settings-button-text'}>{'表示設定'}</span>
  </button>
));

/** For the panel, to hang from it and to give the focus back to it. */
export const DAG_SETTINGS_BUTTON_ID = 'dag-settings-button';

/**
 * Where the panel opens now, from where the button is and how wide the
 * screen is (`view-model/settings-panel.mts`).
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

const openSettings = (): void => {
  uiStore.openSettings(currentSettingsPlacement());
};

/**
 * The 16px path of Blueprint's `cog` icon, as `@blueprintjs/icons` (6.14)
 * has it in `lib/esm/generated/16px/paths/cog.js`, copied for the reason
 * `html-select.tsx` gives.
 */
const COG_16 =
  'M15.19 6.39h-1.85c-.11-.37-.27-.71-.45-1.04l1.36-1.36c.31-.31.31-.82 0-1.13l-1.13-1.13a.803.803 0 0 0-1.13 0l-1.36 1.36c-.33-.17-.67-.33-1.04-.44V.79c0-.44-.36-.8-.8-.8h-1.6c-.44 0-.8.36-.8.8v1.86c-.39.12-.75.28-1.1.47l-1.3-1.3c-.3-.3-.79-.3-1.09 0L1.82 2.91c-.3.3-.3.79 0 1.09l1.3 1.3c-.2.34-.36.7-.48 1.09H.79c-.44 0-.8.36-.8.8v1.6c0 .44.36.8.8.8h1.85c.11.37.27.71.45 1.04l-1.36 1.36c-.31.31-.31.82 0 1.13l1.13 1.13c.31.31.82.31 1.13 0l1.36-1.36c.33.18.67.33 1.04.44v1.86c0 .44.36.8.8.8h1.6c.44 0 .8-.36.8-.8v-1.86c.39-.12.75-.28 1.1-.47l1.3 1.3c.3.3.79.3 1.09 0l1.09-1.09c.3-.3.3-.79 0-1.09l-1.3-1.3c.19-.35.36-.71.48-1.1h1.85c.44 0 .8-.36.8-.8v-1.6a.816.816 0 0 0-.81-.79m-7.2 4.6c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3';
