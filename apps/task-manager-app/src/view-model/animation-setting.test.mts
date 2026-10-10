import {
  animationSettings,
  animationSettingStorage,
  DEFAULT_ANIMATION_SETTING,
  shouldAnimate,
} from './animation-setting.mjs';

describe(animationSettingStorage.parse, () => {
  test('round-trips with serialize', () => {
    for (const setting of animationSettings) {
      assert.strictEqual(
        animationSettingStorage.parse(
          animationSettingStorage.serialize(setting),
        ),
        setting,
      );
    }
  });

  test('is 自動 for nothing stored', () => {
    assert.strictEqual(animationSettingStorage.parse(null), 'auto');

    assert.strictEqual(DEFAULT_ANIMATION_SETTING, 'auto');
  });

  test('is 自動 for what is not a setting', () => {
    for (const stored of ['', 'on', 'not json', '"always"', '1', '["on"]']) {
      assert.strictEqual(animationSettingStorage.parse(stored), 'auto');
    }
  });
});

describe(shouldAnimate, () => {
  test('自動 follows the request for less motion', () => {
    assert.isTrue(shouldAnimate('auto', false));

    assert.isFalse(shouldAnimate('auto', true));
  });

  test('オン animates even when less motion is asked for', () => {
    assert.isTrue(shouldAnimate('on', false));

    assert.isTrue(shouldAnimate('on', true));
  });

  test('オフ never animates', () => {
    assert.isFalse(shouldAnimate('off', false));

    assert.isFalse(shouldAnimate('off', true));
  });
});

test('the stored setting keeps its key and its JSON', () => {
  assert.strictEqual(animationSettingStorage.key, 'task-manager-app:animation');

  assert.strictEqual(animationSettingStorage.serialize('off'), '"off"');
});
