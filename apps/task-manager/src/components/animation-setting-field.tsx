import { HtmlSelect } from 'blueprint-synstate';
import { constant, type JSX } from 'synstate-dom';
import { m } from '../i18n/index.mjs';
import { animationSettingStore } from '../store/index.mjs';
import {
  animationSettingLabels,
  animationSettings,
} from '../view-model/index.mjs';

/**
 * Whether the nodes move to their places in an animation: 「自動」 as the
 * system asks, 「オン」 always, 「オフ」 never. Kept on this device. The
 * hint says what no option shows: under any of them, an animation the device
 * cannot draw smoothly stops with every node in its place.
 */
export const AnimationSettingField = (): JSX.Element => (
  <div class={constant('settings-field')}>
    <label class={constant('settings-field-control')}>
      <span class={constant('settings-field-label')}>
        {constant(m.settings.animation)}
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
      {constant(m.settings.animationHint)}
    </p>
  </div>
);

const HINT_ID = 'animation-setting-hint';
