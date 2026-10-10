/**
 * The animation setting (`view-model/animation-setting.mts`), saved whenever
 * it changes. Whether the nodes move is the DAG layout store's to decide,
 * from this and the system's request for less motion.
 */

import { createState, type InitializedObservable } from 'synstate';
import { type AnimationSetting } from '../view-model/index.mjs';

export type AnimationSettingDeps = Readonly<{
  initial: AnimationSetting;
  save: (setting: AnimationSetting) => void;
}>;

export type AnimationSettingStore = Readonly<{
  setting: InitializedObservable<AnimationSetting>;
  set: (setting: AnimationSetting) => void;
  /** Starts saving, and returns what stops it. */
  start: () => () => void;
}>;

export const createAnimationSettingStore = (
  deps: AnimationSettingDeps,
): AnimationSettingStore => {
  const [setting, setSetting] = createState<AnimationSetting>(deps.initial);

  return {
    setting,
    set: (next) => {
      setSetting(next);
    },
    start: () => {
      const subscription = setting.subscribe(deps.save);

      return () => {
        subscription.unsubscribe();
      };
    },
  };
};
