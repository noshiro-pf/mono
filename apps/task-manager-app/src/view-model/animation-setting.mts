/**
 * Whether the DAG's nodes move to their places in an animation —
 * 「自動」 as the system asks (none for a reader who asks for less motion),
 * 「オン」 always, 「オフ」 never — and how that is kept in `localStorage`
 * between visits, on this device only.
 *
 * Validated on read as the list settings are (`list-settings.mts`): anything
 * that is not a setting gives 「自動」.
 */

import { Json, Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import { type ReadonlyRecord } from 'ts-type-forge';

export const animationSettings = ['auto', 'on', 'off'] as const;

export type AnimationSetting = (typeof animationSettings)[number];

export const ANIMATION_SETTING_STORAGE_KEY = 'task-manager-app:animation';

export const DEFAULT_ANIMATION_SETTING: AnimationSetting = 'auto';

export const animationSettingLabels = {
  auto: '自動',
  on: 'オン',
  off: 'オフ',
} as const satisfies ReadonlyRecord<AnimationSetting, string>;

/** The stored setting, or 「自動」 when there is none to read. */
export const parseAnimationSetting = (
  stored: string | null,
): AnimationSetting => {
  if (stored === null) {
    return DEFAULT_ANIMATION_SETTING;
  }

  const parsed = Result.flatMap(Json.parse(stored), (json) =>
    AnimationSettingType.validate(json),
  );

  return Result.isOk(parsed) ? parsed.value : DEFAULT_ANIMATION_SETTING;
};

export const serializeAnimationSetting = (setting: AnimationSetting): string =>
  JSON.stringify(setting);

/**
 * Whether the nodes are animated under `setting`, for a reader who does or
 * does not ask the system for less motion.
 */
export const shouldAnimate = (
  setting: AnimationSetting,
  reducedMotion: boolean,
): boolean => setting === 'on' || (setting === 'auto' && !reducedMotion);

const AnimationSettingType = t.enumType(animationSettings);
