import {
  DEFAULT_DAG_VIEW_MODE,
  dagViewModeLabels,
  dagViewModes,
  isArrangeable,
  parseDagViewMode,
  serializeDagViewMode,
} from './dag-view-mode.mjs';

describe(parseDagViewMode, () => {
  test('round-trips with serializeDagViewMode', () => {
    for (const mode of dagViewModes) {
      assert.strictEqual(parseDagViewMode(serializeDagViewMode(mode)), mode);
    }
  });

  test('is DAG for nothing stored', () => {
    assert.strictEqual(parseDagViewMode(null), 'dag');

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
      assert.strictEqual(parseDagViewMode(stored), 'dag');
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
