import { constant, view, type JSX } from 'synstate-dom';
import { m } from '../i18n/index.mjs';
import { dagViewModeStore } from '../store/index.mjs';
import { dagViewModeLabels, dagViewModes } from '../view-model/index.mjs';

/**
 * How the graph is drawn: one button per view mode, the pressed one is the
 * mode shown. Kept on this device, and in the URL. A mode added to
 * `dagViewModes` gets its button here with nothing else to do.
 */
export const DagViewModeSwitch = (): JSX.Element => (
  <fieldset
    aria-label={constant(m.dag.viewMode)}
    class={constant('bp6-button-group')}
  >
    {dagViewModes.map((mode) => (
      <button
        aria-pressed={view(dagViewModeStore.mode, (current) =>
          (current === mode).toString(),
        )}
        class={{
          'bp6-button': constant(true),
          'bp6-active': view(
            dagViewModeStore.mode,
            (current) => current === mode,
          ),
        }}
        data-e2e={constant(`dag-mode-${mode}`)}
        type={constant('button')}
        onClick={() => {
          dagViewModeStore.set(mode);
        }}
      >
        {constant(dagViewModeLabels[mode])}
      </button>
    ))}
  </fieldset>
);
