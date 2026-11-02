import * as Num from 'ts-data-forge/number';

// embed-sample-code-ignore-below
if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    // The same functions as `Num` from 'ts-data-forge'
    assert.isTrue(Num.clamp(0, 100)(150) === 100);

    assert.isTrue(Num.isInRange(0, 10)(5));

    // embed-sample-code-ignore-below
  });
}
