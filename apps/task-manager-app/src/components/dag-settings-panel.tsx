import { type GenericEventHandler, type RefCallback } from 'preact';
import { memoNamed } from 'preact-utils';
import { type ReadonlyRecord } from 'ts-type-forge';
import {
  dagViewModeSignal,
  settingsPanelSignal,
  uiStore,
} from '../store/index.mjs';
import { type SettingsPanelPlacement } from '../view-model/index.mjs';
import { AnimationSettingField } from './animation-setting-field.js';
import {
  currentSettingsPlacement,
  DAG_SETTINGS_BUTTON_ID,
} from './dag-settings-button.js';
import { DiagramSortField } from './diagram-sort-field.js';
import { NodeSizeField } from './node-size-field.js';

/**
 * 「表示設定」: the settings of the graph screen, each a section of the
 * panel's body — the node size and the animation, which apply to every view
 * mode, and the order of 「アーク」 and 「タイル」, shown in those two only:
 * in 「DAG」 the reader places the nodes, and an order would change nothing.
 *
 * A native `<dialog>` opened modal, so that the focus goes into it and stays
 * there, and Escape, the close button and a press outside it close it, the
 * focus going back to the button. A popover hanging from the button on a
 * wide screen, a sheet across the bottom on a narrow one
 * (`view-model/settings-panel.mts`), placed again when the screen changes
 * size. Whether and where it is open is the UI store's: the element follows
 * it, as the node dialog follows the editor store.
 */
export const DagSettingsPanel = memoNamed('DagSettingsPanel', () => {
  const placement = settingsPanelSignal.value;

  const ordered = dagViewModeSignal.value !== 'dag';

  return (
    <dialog
      ref={followOpen}
      aria-labelledby={TITLE_ID}
      className={'bp6-card settings-panel'}
      data-e2e={'dag-settings-panel'}
      data-placement={placement?.kind}
      style={styleOf(placement)}
      onCancel={onCancel}
    >
      <div className={'settings-panel-content'}>
        <div className={'settings-panel-header'}>
          <h2 className={'bp6-heading'} id={TITLE_ID}>
            {'表示設定'}
          </h2>
          <button
            aria-label={'閉じる'}
            className={'bp6-button bp6-minimal'}
            data-e2e={'dag-settings-close'}
            type={'button'}
            onClick={uiStore.closeSettings}
          >
            {'×'}
          </button>
        </div>
        <div className={'settings-panel-body'}>
          <NodeSizeField />
          {ordered ? <DiagramSortField /> : undefined}
          <AnimationSettingField />
        </div>
      </div>
    </dialog>
  );
});

// Outside the component, since none of them reads its props.

const followOpen: RefCallback<HTMLDialogElement> = (dialog) => {
  if (dialog === null) {
    return undefined;
  }

  dialog.addEventListener('click', onBackdropClick);

  addEventListener('resize', onResize);

  const subscription = uiStore.settingsPanel.subscribe((placement) => {
    if (placement !== undefined && !dialog.open) {
      dialog.showModal();
    } else if (placement === undefined && dialog.open) {
      dialog.close();

      // The browser may give it back by itself; Safari, which does not
      // focus a button that is clicked, has nothing to give it back to.
      document
        .querySelector<HTMLButtonElement>(`#${DAG_SETTINGS_BUTTON_ID}`)
        ?.focus();
    }
  });

  return () => {
    subscription.unsubscribe();

    removeEventListener('resize', onResize);

    dialog.removeEventListener('click', onBackdropClick);
  };
};

/** A popover at its place; a sheet where the style sheet puts it. */
const styleOf = (
  placement: SettingsPanelPlacement | undefined,
): ReadonlyRecord<string, string> | undefined =>
  placement?.kind === 'popover'
    ? ({
        top: `${placement.top}px`,
        right: `${placement.right}px`,
        maxHeight: `${placement.maxHeight}px`,
      } as const)
    : undefined;

const onResize = (): void => {
  uiStore.placeSettings(currentSettingsPlacement());
};

/** Escape: closed through the store, which then closes the element. */
const onCancel: GenericEventHandler<HTMLDialogElement> = (cancelled) => {
  cancelled.preventDefault();

  uiStore.closeSettings();
};

/**
 * The content fills the dialog, so a click whose target is the dialog
 * itself landed on the backdrop around it: outside the panel.
 */
const onBackdropClick = (clicked: MouseEvent): void => {
  if (clicked.target === clicked.currentTarget) {
    uiStore.closeSettings();
  }
};

const TITLE_ID = 'dag-settings-title';
