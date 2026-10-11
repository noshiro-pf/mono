import { sameItemsIfEqual } from './share.mjs';

describe(sameItemsIfEqual, () => {
  test('keeps the previous array when every item is equal', () => {
    const previous = [item(1, 'a'), item(2, 'b')] as const;

    assert.strictEqual(
      sameItemsIfEqual(previous, [item(1, 'a'), item(2, 'b')]),
      previous,
    );
  });

  test('keeps each unchanged item, found by number, and takes the changed ones', () => {
    const one = item(1, 'a');

    const two = item(2, 'b');

    const changed = item(2, 'b, edited');

    const added = item(3, 'c');

    const shared = sameItemsIfEqual([one, two], [added, one, changed]);

    assert.deepStrictEqual(shared, [added, one, changed]);

    assert.strictEqual(shared[0], added);

    assert.strictEqual(shared[1], one);

    assert.strictEqual(shared[2], changed);
  });
});

const item = (
  number: number,
  title: string,
): Readonly<{ number: number; title: string }> => ({ number, title }) as const;
