import {
  DEFAULT_NODE_SIZE,
  nodeSizeLabels,
  nodeSizes,
  parseNodeSize,
  serializeNodeSize,
} from './node-size.mjs';

describe(parseNodeSize, () => {
  test('round-trips with serializeNodeSize', () => {
    for (const size of nodeSizes) {
      assert.strictEqual(parseNodeSize(serializeNodeSize(size)), size);
    }
  });

  test('is 標準 for nothing stored', () => {
    assert.strictEqual(parseNodeSize(null), 'standard');

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
      assert.strictEqual(parseNodeSize(stored), 'standard');
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
