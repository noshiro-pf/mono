import { type AnimationSetting } from '../view-model/index.mjs';
import { createAnimationSettingStore } from './animation-setting-store.mjs';

const setup = (
  initial: AnimationSetting,
): Readonly<{
  store: ReturnType<typeof createAnimationSettingStore>;
  saved: readonly AnimationSetting[];
}> => {
  const mut_saved: AnimationSetting[] = [];

  const store = createAnimationSettingStore({
    initial,
    save: (setting) => {
      mut_saved.push(setting);
    },
  });

  store.start();

  return { store, saved: mut_saved };
};

describe(createAnimationSettingStore, () => {
  test('starts from the setting read', () => {
    const { store } = setup('off');

    assert.strictEqual(store.setting.getSnapshot().value, 'off');
  });

  test('saves every change', () => {
    const { store, saved } = setup('auto');

    store.set('on');

    store.set('off');

    assert.deepStrictEqual(saved, ['auto', 'on', 'off']);

    assert.strictEqual(store.setting.getSnapshot().value, 'off');
  });
});
