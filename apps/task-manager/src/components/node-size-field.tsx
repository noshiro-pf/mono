import { constant, view, type JSX } from 'synstate-dom';
import { nodeSizeStore } from '../store/index.mjs';
import { nodeSizeLabels, nodeSizes } from '../view-model/index.mjs';

/**
 * How big the nodes are drawn, in every view mode: 「標準」, a title and a
 * line of status and priority; 「コンパクト」, the title alone. One button
 * per size, the pressed one is the size shown. Kept on this device.
 */
export const NodeSizeField = (): JSX.Element => (
  <fieldset
    aria-describedby={constant(HINT_ID)}
    class={constant('settings-field')}
  >
    <legend class={constant('settings-field-label')}>
      {constant('ノード')}
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
      {constant(
        '「コンパクト」はタイトルだけを 1 行で表示します。状態と優先度は色と、ポインタを重ねたときの説明で分かります。',
      )}
    </p>
  </fieldset>
);

const HINT_ID = 'node-size-hint';
