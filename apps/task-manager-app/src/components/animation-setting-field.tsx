import type { GenericEventHandler } from 'preact';
import { memoNamed } from 'preact-utils';
import {
  animationSettingSignal,
  animationSettingStore,
} from '../store/index.mjs';
import {
  animationSettingLabels,
  animationSettings,
} from '../view-model/index.mjs';
import { HtmlSelect } from './html-select.js';

/**
 * Whether the nodes move to their places in an animation: 「自動」 as the
 * system asks, 「オン」 always, 「オフ」 never. Kept on this device. The
 * hint says what no option shows: under any of them, an animation the
 * device cannot draw smoothly stops with every node in its place.
 */
export const AnimationSettingField = memoNamed('AnimationSettingField', () => (
  <div className={'settings-field'}>
    <label className={'settings-field-control'}>
      <span className={'settings-field-label'}>{'アニメーション'}</span>
      <HtmlSelect
        aria-describedby={HINT_ID}
        data-e2e={'dag-animation'}
        value={animationSettingSignal.value}
        onChange={onAnimationChange}
      >
        {animationSettings.map((setting) => (
          <option key={setting} value={setting}>
            {animationSettingLabels[setting]}
          </option>
        ))}
      </HtmlSelect>
    </label>
    <p className={'settings-hint'} id={HINT_ID}>
      {
        'ノードが位置へ移るときのアニメーション。「自動」は端末の「視差効果を減らす」に従います。どの設定でも、動きが重いときは途中で止めてすぐ位置に置きます。'
      }
    </p>
  </div>
));

const onAnimationChange: GenericEventHandler<HTMLSelectElement> = (changed) => {
  const picked = animationSettings.find(
    (setting) => setting === changed.currentTarget.value,
  );

  if (picked !== undefined) {
    animationSettingStore.set(picked);
  }
};

const HINT_ID = 'animation-setting-hint';
