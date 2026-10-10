/**
 * Whether the DAG's nodes move to their places in an animation —
 * 「自動」 as the system asks (none for a reader who asks for less motion),
 * 「オン」 always, 「オフ」 never — and how that is kept in `localStorage`
 * between visits, on this device only.
 *
 * Kept as every setting is (`persisted-setting.mts`): anything stored that
 * is not a setting gives 「自動」.
 */

import * as t from 'ts-fortress';
import { type ReadonlyRecord } from 'ts-type-forge';
import { persistedSetting } from './persisted-setting.mjs';

export const animationSettings = ['auto', 'on', 'off'] as const;

export const AnimationSettingCodec = t.enumType(animationSettings, {
  defaultValue: 'auto',
});

export type AnimationSetting = t.TypeOf<typeof AnimationSettingCodec>;

export const DEFAULT_ANIMATION_SETTING: AnimationSetting =
  AnimationSettingCodec.defaultValue;

export const animationSettingStorage = persistedSetting(AnimationSettingCodec, {
  key: 'task-manager-app:animation',
});

export const animationSettingLabels = {
  auto: '自動',
  on: 'オン',
  off: 'オフ',
} as const satisfies ReadonlyRecord<AnimationSetting, string>;

/**
 * Whether the nodes are animated under `setting`, for a reader who does or
 * does not ask the system for less motion.
 */
export const shouldAnimate = (
  setting: AnimationSetting,
  reducedMotion: boolean,
): boolean => setting === 'on' || (setting === 'auto' && !reducedMotion);
