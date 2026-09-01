import { changeOriginOfPos, changeOriginOfRect } from './change-origin.mjs';

describe(changeOriginOfPos, () => {
  test('case 1', () => {
    const pos = { x: 300, y: 400 } as const;

    const changeOriginFn = changeOriginOfPos(
      { x: 0, y: 0 },
      { x: 200, y: 100 },
    );

    assert.deepStrictEqual(changeOriginFn(pos), { x: 100, y: 300 });
  });

  test('case 2', () => {
    const pos = { x: 500, y: 400 } as const;

    const changeOriginFn = changeOriginOfPos(
      { x: 200, y: 100 },
      { x: 0, y: 0 },
    );

    assert.deepStrictEqual(changeOriginFn(pos), { x: 700, y: 500 });
  });
});

describe(changeOriginOfRect, () => {
  test('case 1', () => {
    const rect = { left: 300, top: 400, width: 50, height: 50 } as const;

    const changeOriginFn = changeOriginOfRect(
      { x: 0, y: 0 },
      { x: 200, y: 100 },
    );

    assert.deepStrictEqual(changeOriginFn(rect), {
      left: 100,
      top: 300,
      width: 50,
      height: 50,
    });
  });

  test('case 2', () => {
    const rect = { left: 500, top: 400, width: 50, height: 50 } as const;

    const changeOriginFn = changeOriginOfRect(
      { x: 200, y: 100 },
      { x: 0, y: 0 },
    );

    assert.deepStrictEqual(changeOriginFn(rect), {
      left: 700,
      top: 500,
      width: 50,
      height: 50,
    });
  });
});
