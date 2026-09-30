import { keepIfEqual, sameItemsIfEqual } from './share.mjs';

describe(keepIfEqual, () => {
  test('keeps what it holds when what it is given is equal to it', () => {
    const held: Counts = { open: 1, labels: ['a'] } as const;

    assert.strictEqual(keepIfEqual(held, { open: 1, labels: ['a'] }), held);
  });

  test('takes what it is given when it differs', () => {
    const given: Counts = { open: 2, labels: ['a'] } as const;

    assert.strictEqual(keepIfEqual({ open: 1, labels: ['a'] }, given), given);
  });
});

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

type Counts = Readonly<{ open: number; labels: readonly string[] }>;

const item = (
  number: number,
  title: string,
): Readonly<{ number: number; title: string }> => ({ number, title }) as const;
