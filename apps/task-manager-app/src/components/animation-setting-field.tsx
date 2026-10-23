import { constant, type JSX } from 'synstate-dom';
import { animationSettingStore } from '../store/index.mjs';
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
export const AnimationSettingField = (): JSX.Element => (
  <div class={constant('settings-field')}>
    <label class={constant('settings-field-control')}>
      <span class={constant('settings-field-label')}>
        {constant('アニメーション')}
      </span>
      <HtmlSelect
        aria-describedby={constant(HINT_ID)}
        data-e2e={constant('dag-animation')}
        value={animationSettingStore.setting}
        onChange={(changed) => {
          const picked = animationSettings.find(
            (setting) => setting === changed.currentTarget.value,
          );

          if (picked !== undefined) {
            animationSettingStore.set(picked);
          }
        }}
      >
        {animationSettings.map((setting) => (
          <option value={constant(setting)}>
            {constant(animationSettingLabels[setting])}
          </option>
        ))}
      </HtmlSelect>
    </label>
    <p class={constant('settings-hint')} id={constant(HINT_ID)}>
      {constant(
        'ノードが位置へ移るときのアニメーション。「自動」は端末の「視差効果を減らす」に従います。どの設定でも、動きが重いときは途中で止めてすぐ位置に置きます。',
      )}
    </p>
  </div>
);

const HINT_ID = 'animation-setting-hint';
