import {
  DEFAULT_DAG_VIEW_MODE,
  dagViewModeLabels,
  dagViewModeStorage,
  dagViewModes,
  isArrangeable,
} from './dag-view-mode.mjs';

describe(dagViewModeStorage.parse, () => {
  test('round-trips with serialize', () => {
    for (const mode of dagViewModes) {
      assert.strictEqual(
        dagViewModeStorage.parse(dagViewModeStorage.serialize(mode)),
        mode,
      );
    }
  });

  test('is DAG for nothing stored', () => {
    assert.strictEqual(dagViewModeStorage.parse(null), 'dag');

    assert.strictEqual(DEFAULT_DAG_VIEW_MODE, 'dag');
  });

  test('is DAG for what is not a mode', () => {
    for (const stored of [
      '',
      'arc',
      'tile',
      'not json',
      '"grid"',
      '1',
      '["arc"]',
    ]) {
      assert.strictEqual(dagViewModeStorage.parse(stored), 'dag');
    }
  });
});

describe(isArrangeable, () => {
  test('only the DAG is arranged by hand', () => {
    assert.isTrue(isArrangeable('dag'));

    assert.isFalse(isArrangeable('arc'));

    assert.isFalse(isArrangeable('tile'));
  });
});

test('every mode has a label', () => {
  assert.deepStrictEqual(
    dagViewModes.map((mode) => dagViewModeLabels[mode]),
    ['DAG', 'アーク', 'タイル'],
  );
});

test('the stored setting keeps its key and its JSON', () => {
  assert.strictEqual(dagViewModeStorage.key, 'task-manager-app:dag-view-mode');

  assert.strictEqual(dagViewModeStorage.serialize('tile'), '"tile"');
});
