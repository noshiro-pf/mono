import { constant, view, type JSX } from 'synstate-dom';
import { m } from '../i18n/index.mjs';
import { nodeSizeStore } from '../store/index.mjs';
import { nodeSizeLabels, nodeSizes } from '../view-model/index.mjs';

/**
 * How big the nodes are drawn, in every view mode: 「コンパクト」, the title
 * alone; 「標準」, a title and its due date; 「大」, as 「標準」 with the
 * title on up to three lines. One button per size, the pressed one is the
 * size shown. Kept on this device.
 */
export const NodeSizeField = (): JSX.Element => (
  <fieldset
    aria-describedby={constant(HINT_ID)}
    class={constant('settings-field')}
  >
    <legend class={constant('settings-field-label')}>
      {constant(m.settings.nodeSize)}
    </legend>
    <div class={constant('bp6-button-group')}>
      {nodeSizes.map((size) => (
        <button
          aria-pressed={view(nodeSizeStore.size, (current) =>
            (current === size).toString(),
          )}
          class={{
            'bp6-button': constant(true),
            'bp6-active': view(
              nodeSizeStore.size,
              (current) => current === size,
            ),
          }}
          data-e2e={constant(`dag-node-size-${size}`)}
          type={constant('button')}
          onClick={() => {
            nodeSizeStore.set(size);
          }}
        >
          {constant(nodeSizeLabels[size])}
        </button>
      ))}
    </div>
    <p class={constant('settings-hint')} id={constant(HINT_ID)}>
      {constant(m.settings.nodeSizeHint)}
    </p>
  </fieldset>
);

const HINT_ID = 'node-size-hint';
