import { combine, createState } from 'synstate-next';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('combine', () => {
    // embed-sample-code-ignore-above
    const [width, setWidth] = createState(2);

    const [height, setHeight] = createState(3);

    const size = combine([width, height]);

    assert.deepStrictEqual(size.value, [2, 3]);

    setWidth(4);

    setHeight(5);

    assert.deepStrictEqual(size.value, [4, 5]);

    // embed-sample-code-ignore-below
  });
}
