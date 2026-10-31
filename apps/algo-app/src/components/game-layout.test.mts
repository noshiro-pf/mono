import { gameLayoutOf } from './game-layout.mjs';

describe(gameLayoutOf, () => {
  test('sizes the square table from the shorter side, and the header and footer from the height', () => {
    assert.deepStrictEqual(gameLayoutOf({ width: 1000, height: 500 }), {
      tableSize: { width: 400, height: 400 },
      headerHeight: 25,
      footerHeight: 50,
    });

    assert.deepStrictEqual(gameLayoutOf({ width: 500, height: 1000 }), {
      tableSize: { width: 400, height: 400 },
      headerHeight: 50,
      footerHeight: 100,
    });
  });
});
