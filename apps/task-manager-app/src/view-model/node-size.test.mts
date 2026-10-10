import {
  DEFAULT_NODE_SIZE,
  nodeSizeLabels,
  nodeSizes,
  nodeSizeStorage,
} from './node-size.mjs';

describe(nodeSizeStorage.parse, () => {
  test('round-trips with serialize', () => {
    for (const size of nodeSizes) {
      assert.strictEqual(
        nodeSizeStorage.parse(nodeSizeStorage.serialize(size)),
        size,
      );
    }
  });

  test('is 標準 for nothing stored', () => {
    assert.strictEqual(nodeSizeStorage.parse(null), 'standard');

    assert.strictEqual(DEFAULT_NODE_SIZE, 'standard');
  });

  test('is 標準 for what is not a size', () => {
    for (const stored of [
      '',
      'compact',
      'not json',
      '"small"',
      '1',
      '["compact"]',
      '{"size":"compact"}',
    ]) {
      assert.strictEqual(nodeSizeStorage.parse(stored), 'standard');
    }
  });
});

describe('the labels of the sizes', () => {
  test('label every size', () => {
    assert.deepStrictEqual(
      nodeSizes.map((size) => nodeSizeLabels[size]),
      ['標準', 'コンパクト'],
    );
  });
});

test('the stored setting keeps its key and its JSON', () => {
  assert.strictEqual(nodeSizeStorage.key, 'task-manager-app:node-size');

  assert.strictEqual(nodeSizeStorage.serialize('compact'), '"compact"');
});
