import { gameLayoutOf } from './game-layout.mjs';

describe(gameLayoutOf, () => {
  test('sizes the square table from the shorter side, and the header and footer from the height', () => {
    assert.deepStrictEqual(gameLayoutOf({ width: 1000, height: 500 }), {
      tableSize: { width: 425, height: 425 },
      headerHeight: 25,
      footerHeight: 50,
    });

    assert.deepStrictEqual(gameLayoutOf({ width: 500, height: 1000 }), {
      tableSize: { width: 425, height: 425 },
      headerHeight: 50,
      footerHeight: 100,
    });
  });

  test('rounds every size down to whole pixels', () => {
    assert.deepStrictEqual(gameLayoutOf({ width: 1001, height: 777.7 }), {
      tableSize: { width: 660, height: 660 },
      headerHeight: 38,
      footerHeight: 77,
    });
  });
});
