import { DEFAULT_DAG_SHOW_DONE, dagShowDoneStorage } from './dag-show-done.mjs';

describe(dagShowDoneStorage.parse, () => {
  test('round-trips with serialize', () => {
    for (const showDone of [true, false]) {
      assert.strictEqual(
        dagShowDoneStorage.parse(dagShowDoneStorage.serialize(showDone)),
        showDone,
      );
    }
  });

  test('hides them for nothing stored', () => {
    assert.isFalse(dagShowDoneStorage.parse(null));

    assert.isFalse(DEFAULT_DAG_SHOW_DONE);
  });

  test('hides them for what is not a setting', () => {
    for (const stored of ['', 'yes', 'not json', '"true"', '1', '[true]']) {
      assert.isFalse(dagShowDoneStorage.parse(stored));
    }
  });
});

test('the stored setting keeps its key and its JSON', () => {
  assert.strictEqual(dagShowDoneStorage.key, 'task-manager-app:dag-show-done');

  assert.strictEqual(dagShowDoneStorage.serialize(true), 'true');
});
