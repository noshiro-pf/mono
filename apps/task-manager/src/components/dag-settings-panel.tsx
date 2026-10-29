import { constant, If, view, type JSX, type View } from 'synstate-dom';
import { m } from '../i18n/index.mjs';
import { dagViewModeStore, uiStore } from '../store/index.mjs';
import { AnimationSettingField } from './animation-setting-field.js';
import { DagFilterField } from './dag-filter-field.js';
import {
  currentSettingsPlacement,
  DAG_SETTINGS_BUTTON_ID,
} from './dag-settings-button.js';
import { DagShowDoneField } from './dag-show-done-field.js';
import { DiagramSortField } from './diagram-sort-field.js';
import { followModal } from './follow-modal.mjs';
import { LanguageField } from './language-field.js';
import { NodeSizeField } from './node-size-field.js';
import { listenInScope } from './scope-effects.mjs';

/**
 * 「表示設定」: the settings of the graph screen, each a section of the
 * panel's body — first what is drawn: the filter by group and label, and
 * whether the done tasks are drawn, the node size and the
 * animation, which apply to every view mode, and the order of 「アーク」 and
 * 「タイル」, shown in those two only: in 「DAG」 the reader places the nodes,
 * and an order would change nothing. Last, the language of the whole page.
 *
 * A native `<dialog>` opened modal, so that the focus goes into it and stays
 * there, and Escape, the close button and a press outside it close it, the
 * focus going back to the button. The focus goes to the panel itself, which
 * draws no ring, rather than to its first button: the close button would
 * otherwise open with a ring round it, as if it were the one thing to do. A
 * popover hanging from the button on a wide screen, a sheet across the
 * bottom on a narrow one (`view-model/settings-panel.mts`), placed again
 * when the screen changes size. Whether and where it is open is the UI
 * store's: the element follows it, as the node dialog follows the editor
 * store.
 */
export const DagSettingsPanel = (): JSX.Element => {
  const popoverStyle = (
    property: 'top' | 'right' | 'maxHeight',
  ): View<string | undefined> =>
    view(uiStore.settingsPanel, (placement) =>
      placement?.kind === 'popover' ? `${placement[property]}px` : undefined,
    );

  return (
    <dialog
      ref={(dialog) => {
        followModal(
          dialog,
          uiStore.settingsPanel,
          (placement) => placement !== undefined,
          uiStore.closeSettings,
          {
            opened: () => {
              dialog.focus();
            },
            closed: () => {
              // The browser may give it back by itself; Safari, which does
              // not focus a button that is clicked, has nothing to give it
              // back to.
              document
                .querySelector<HTMLButtonElement>(`#${DAG_SETTINGS_BUTTON_ID}`)
                ?.focus();
            },
          },
        );

        listenInScope(globalThis, 'resize', () => {
          uiStore.placeSettings(currentSettingsPlacement());
        });
      }}
      aria-labelledby={constant(TITLE_ID)}
      class={constant('bp6-card settings-panel')}
      data-e2e={constant('dag-settings-panel')}
      data-placement={view(
        uiStore.settingsPanel,
        (placement) => placement?.kind,
      )}
      // A popover at its place; a sheet where the style sheet puts it.
      style={{
        top: popoverStyle('top'),
        right: popoverStyle('right'),
        'max-height': popoverStyle('maxHeight'),
      }}
      tabIndex={constant(-1)}
      onCancel={(cancelled) => {
        // Escape: closed through the store, which then closes the element.
        cancelled.preventDefault();

        uiStore.closeSettings();
      }}
    >
      <div class={constant('settings-panel-content')}>
        <div class={constant('settings-panel-header')}>
          <h2 class={constant('bp6-heading')} id={constant(TITLE_ID)}>
            {constant(m.settings.title)}
          </h2>
          <button
            aria-label={constant(m.common.close)}
            class={constant('bp6-button bp6-minimal')}
            data-e2e={constant('dag-settings-close')}
            type={constant('button')}
            onClick={uiStore.closeSettings}
          >
            {constant('×')}
          </button>
        </div>
        <div class={constant('settings-panel-body')}>
          <DagFilterField />
          <DagShowDoneField />
          <NodeSizeField />
          <If
            cond={view(dagViewModeStore.mode, (mode) => mode !== 'dag')}
            then={<DiagramSortField />}
          />
          <AnimationSettingField />
          <LanguageField />
        </div>
      </div>
    </dialog>
  );
};

const TITLE_ID = 'dag-settings-title';
