import { accentColorOf, faviconLayoutOf, faviconPx } from '../src/index.mjs';

describe('faviconLayoutOf', () => {
  test('labels the favicon with the position, from 1', () => {
    assert.deepStrictEqual(faviconLayoutOf(3).label, '3');

    assert.deepStrictEqual(faviconLayoutOf(0).label, '1');
  });

  // The number sits on the icon rather than on a badge in its corner: a badge
  // is what a count of unread notifications looks like.
  test('draws the icon over the whole favicon', () => {
    assert.deepStrictEqual(faviconLayoutOf(3).icon, {
      x: 0,
      y: 0,
      size: faviconPx,
    });
  });

  test('shrinks the number for more digits', () => {
    const one = faviconLayoutOf(3);

    const two = faviconLayoutOf(12);

    const three = faviconLayoutOf(123);

    assert.isTrue(two.fontPx < one.fontPx);

    assert.isTrue(three.fontPx < two.fontPx);

    assert.isTrue(one.fontPx < faviconPx);
  });

  test('keeps the outline thinner than a digit stroke', () => {
    for (const position of [3, 12, 123]) {
      const { fontPx, outlinePx } = faviconLayoutOf(position);

      assert.isTrue(outlinePx > 0);

      assert.isTrue(outlinePx < fontPx / 4);
    }
  });
});

describe('accentColorOf', () => {
  test('gives adjacent positions different colours', () => {
    assert.notStrictEqual(accentColorOf(1), accentColorOf(2));

    assert.notStrictEqual(accentColorOf(2), accentColorOf(3));
  });

  test('treats a position below 1 as 1', () => {
    assert.deepStrictEqual(accentColorOf(0), accentColorOf(1));
  });
});
