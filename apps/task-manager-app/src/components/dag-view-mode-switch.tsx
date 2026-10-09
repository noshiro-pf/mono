import { type GenericEventHandler } from 'preact';
import { memoNamed } from 'preact-utils';
import { dagViewModeSignal, dagViewModeStore } from '../store/index.mjs';
import { dagViewModeLabels, dagViewModes } from '../view-model/index.mjs';

/**
 * How the graph is drawn: one button per view mode, the pressed one is the
 * mode shown. Kept on this device. A mode added to `dagViewModes` gets its
 * button here with nothing else to do.
 */
export const DagViewModeSwitch = memoNamed('DagViewModeSwitch', () => {
  const current = dagViewModeSignal.value;

  return (
    <fieldset aria-label={'表示形式'} className={'bp6-button-group'}>
      {dagViewModes.map((mode) => (
        <button
          key={mode}
          aria-pressed={mode === current}
          className={`bp6-button ${mode === current ? 'bp6-active' : ''}`}
          data-e2e={`dag-mode-${mode}`}
          type={'button'}
          value={mode}
          onClick={onModeClick}
        >
          {dagViewModeLabels[mode]}
        </button>
      ))}
    </fieldset>
  );
});

const onModeClick: GenericEventHandler<HTMLButtonElement> = (clicked) => {
  const picked = dagViewModes.find(
    (mode) => mode === clicked.currentTarget.value,
  );

  if (picked !== undefined) {
    dagViewModeStore.set(picked);
  }
};
