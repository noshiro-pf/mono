import {
  anchoredTileScroll,
  clampTileScroll,
  maxTileScroll,
  revealTileScroll,
  TILE_MIN_THUMB,
  tileKeyScroll,
  tileScrollOf,
  tileScrollThumb,
  tileViewTransform,
  wheelScrollPixels,
} from './tile-scroll.mjs';

describe(maxTileScroll, () => {
  test('is how far the content reaches below the viewport', () => {
    assert.strictEqual(maxTileScroll(1000, 400), 600);
  });

  test('is zero for content shorter than the viewport', () => {
    assert.strictEqual(maxTileScroll(300, 400), 0);

    assert.strictEqual(maxTileScroll(0, 400), 0);
  });
});

describe(clampTileScroll, () => {
  test('keeps the first row from leaving the top', () => {
    assert.strictEqual(clampTileScroll(-30, 1000, 400), 0);
  });

  test('keeps the last row from going above the bottom', () => {
    assert.strictEqual(clampTileScroll(900, 1000, 400), 600);
  });

  test('leaves an offset in range as it is', () => {
    assert.strictEqual(clampTileScroll(250, 1000, 400), 250);
  });

  test('does not scroll content shorter than the viewport', () => {
    assert.strictEqual(clampTileScroll(120, 300, 400), 0);

    assert.strictEqual(clampTileScroll(-120, 300, 400), 0);
  });
});

describe(tileKeyScroll, () => {
  test('pages down and up by most of the viewport', () => {
    const down = tileKeyScroll('PageDown', 100, 400, 2000);

    assert.isDefined(down);

    assert.isAbove(down, 100 + 400 / 2);

    assert.isBelow(down, 100 + 400);

    assert.strictEqual(tileKeyScroll('PageUp', down, 400, 2000), 100);
  });

  test('goes to the top and to the bottom', () => {
    assert.strictEqual(tileKeyScroll('Home', 700, 400, 2000), 0);

    assert.strictEqual(tileKeyScroll('End', 100, 400, 2000), 1600);
  });

  test('stops at either end', () => {
    assert.strictEqual(tileKeyScroll('PageUp', 50, 400, 2000), 0);

    assert.strictEqual(tileKeyScroll('PageDown', 1500, 400, 2000), 1600);
  });

  test('scrolls nothing for content shorter than the viewport', () => {
    assert.strictEqual(tileKeyScroll('PageDown', 0, 400, 300), 0);

    assert.strictEqual(tileKeyScroll('End', 0, 400, 300), 0);
  });

  test('is nothing for any other key', () => {
    for (const key of ['ArrowDown', 'ArrowUp', ' ', 'Enter', 'Tab', 'a']) {
      assert.isUndefined(tileKeyScroll(key, 100, 400, 2000));
    }
  });
});

describe(wheelScrollPixels, () => {
  test('takes pixels as they are', () => {
    assert.strictEqual(wheelScrollPixels(53, 0, 400), 53);

    assert.strictEqual(wheelScrollPixels(-53, 0, 400), -53);
  });

  test('takes lines as 16 pixels', () => {
    assert.strictEqual(wheelScrollPixels(3, 1, 400), 48);
  });

  test('takes pages as the viewport', () => {
    assert.strictEqual(wheelScrollPixels(-1, 2, 400), -400);
  });
});

describe(revealTileScroll, () => {
  test('leaves a node in view where it is', () => {
    assert.strictEqual(revealTileScroll(100, 150, 200, 400), 100);
  });

  test('scrolls up to a node above the view, to its top', () => {
    assert.strictEqual(revealTileScroll(300, 150, 200, 400), 150);
  });

  test('scrolls down to a node below the view, to its bottom', () => {
    assert.strictEqual(revealTileScroll(0, 450, 500, 400), 100);
  });

  test('shows the top of a node taller than the view', () => {
    assert.strictEqual(revealTileScroll(0, 450, 1000, 400), 450);
  });
});

describe(anchoredTileScroll, () => {
  // Six nodes 40 high, rows 50 apart: three to a row before, one after.
  const ids = ['a', 'b', 'c', 'd', 'e', 'f'] as const;

  const threeColumns = new Map(
    ids.map(
      (id, index) =>
        [id, { x: (index % 3) * 110, y: Math.floor(index / 3) * 50 }] as const,
    ),
  );

  const oneColumn = new Map(
    ids.map((id, index) => [id, { x: 0, y: index * 50 }] as const),
  );

  test('keeps the first node of the first row in view where it was', () => {
    // Scrolled to the second row exactly: 「d」 at the top, and after.
    assert.strictEqual(
      anchoredTileScroll(ids, threeColumns, oneColumn, 50, 40),
      150,
    );

    assert.strictEqual(
      anchoredTileScroll(ids, oneColumn, threeColumns, 150, 40),
      50,
    );
  });

  test('keeps a row partly scrolled out as far out', () => {
    // 10 into the second row: 「d」 is 10 above the top, and stays so.
    assert.strictEqual(
      anchoredTileScroll(ids, threeColumns, oneColumn, 60, 40),
      160,
    );
  });

  test('takes the next row once a row is scrolled out', () => {
    // 45 is past the bottom of the first row (40): the second row is first.
    assert.strictEqual(
      anchoredTileScroll(ids, threeColumns, oneColumn, 45, 40),
      145,
    );
  });

  test('is the top when scrolled to the top', () => {
    assert.strictEqual(
      anchoredTileScroll(ids, threeColumns, oneColumn, 0, 40),
      0,
    );
  });

  test('stays where it is with nothing to anchor to', () => {
    assert.strictEqual(
      anchoredTileScroll([], threeColumns, oneColumn, 80, 40),
      80,
    );
  });
});

describe(tileScrollThumb, () => {
  test('is as tall a share of the track as the viewport is of the content', () => {
    assert.deepStrictEqual(tileScrollThumb(0, 400, 1600, 400), {
      top: 0,
      height: 100,
    });
  });

  test('goes from the top of the track to the bottom', () => {
    assert.deepStrictEqual(tileScrollThumb(1200, 400, 1600, 400), {
      top: 300,
      height: 100,
    });

    assert.deepStrictEqual(tileScrollThumb(600, 400, 1600, 400), {
      top: 150,
      height: 100,
    });
  });

  test('is never shorter than a thumb can be seen', () => {
    const thumb = tileScrollThumb(0, 100, 100_000, 400);

    assert.strictEqual(thumb?.height, TILE_MIN_THUMB);
  });

  test('is nothing when there is nothing to scroll', () => {
    assert.isUndefined(tileScrollThumb(0, 400, 300, 400));

    assert.isUndefined(tileScrollThumb(0, 400, 400, 400));
  });
});

describe(tileViewTransform, () => {
  test('is unscaled, at the margin, the content moved up by the offset', () => {
    const transform = tileViewTransform(120, 60);

    assert.strictEqual(transform.scale, 1);

    assert.strictEqual(transform.y, 60 - 120);

    assert.strictEqual(tileScrollOf(transform, 60), 120);
  });
});
