/**
 * What the page is showing: the list or the DAG, the message at the top, if
 * any, and the graph screen's 「表示設定」 panel — where it is open, if it
 * is — which a change of view closes. Which node's dialog is open is
 * `editor-store.mts`.
 */

import { createState, type InitializedObservable } from 'synstate';
import { type SettingsPanelPlacement } from '../view-model/index.mjs';

export type View = 'list' | 'dag';

export type UiDeps = Readonly<{
  initialView: View;
}>;

export type UiStore = Readonly<{
  view: InitializedObservable<View>;
  notice: InitializedObservable<string | undefined>;
  /**
   * Where the 「表示設定」 panel of the graph screen is open, and
   * `undefined` while it is closed.
   */
  settingsPanel: InitializedObservable<SettingsPanelPlacement | undefined>;
  setView: (view: View) => void;
  showNotice: (message: string) => void;
  dismissNotice: () => void;
  openSettings: (placement: SettingsPanelPlacement) => void;
  /** A new place for the panel, when the screen changes; none while closed. */
  placeSettings: (placement: SettingsPanelPlacement) => void;
  closeSettings: () => void;
}>;

export const createUiStore = (deps: UiDeps): UiStore => {
  const [view, setView] = createState<View>(deps.initialView);

  const [notice, setNotice] = createState<string | undefined>(undefined);

  const [settingsPanel, setSettingsPanel, { getSnapshot: getSettingsPanel }] =
    createState<SettingsPanelPlacement | undefined>(undefined);

  return {
    view,
    notice,
    settingsPanel,
    setView: (next) => {
      setSettingsPanel(undefined);

      setView(next);
    },
    showNotice: (message) => {
      setNotice(message);
    },
    dismissNotice: () => {
      setNotice(undefined);
    },
    openSettings: (placement) => {
      setSettingsPanel(placement);
    },
    placeSettings: (placement) => {
      if (getSettingsPanel() !== undefined) {
        setSettingsPanel(placement);
      }
    },
    closeSettings: () => {
      setSettingsPanel(undefined);
    },
  };
};
