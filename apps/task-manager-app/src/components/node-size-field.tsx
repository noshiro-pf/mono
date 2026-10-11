import type { GenericEventHandler } from 'preact';
import { memoNamed } from 'preact-utils';
import { nodeSizeSignal, nodeSizeStore } from '../store/index.mjs';
import { nodeSizeLabels, nodeSizes } from '../view-model/index.mjs';

/**
 * How big the nodes are drawn, in every view mode: 「標準」, a title and a
 * line of status and priority; 「コンパクト」, the title alone. One button
 * per size, the pressed one is the size shown. Kept on this device.
 */
export const NodeSizeField = memoNamed('NodeSizeField', () => {
  const current = nodeSizeSignal.value;

  return (
    <fieldset aria-describedby={HINT_ID} className={'settings-field'}>
      <legend className={'settings-field-label'}>{'ノード'}</legend>
      <div className={'bp6-button-group'}>
        {nodeSizes.map((size) => (
          <button
            key={size}
            aria-pressed={size === current}
            className={`bp6-button ${size === current ? 'bp6-active' : ''}`}
            data-e2e={`dag-node-size-${size}`}
            type={'button'}
            value={size}
            onClick={onSizeClick}
          >
            {nodeSizeLabels[size]}
          </button>
        ))}
      </div>
      <p className={'settings-hint'} id={HINT_ID}>
        {
          '「コンパクト」はタイトルだけを 1 行で表示します。状態と優先度は色と、ポインタを重ねたときの説明で分かります。'
        }
      </p>
    </fieldset>
  );
});

const onSizeClick: GenericEventHandler<HTMLButtonElement> = (clicked) => {
  const picked = nodeSizes.find((size) => size === clicked.currentTarget.value);

  if (picked !== undefined) {
    nodeSizeStore.set(picked);
  }
};

const HINT_ID = 'node-size-hint';
