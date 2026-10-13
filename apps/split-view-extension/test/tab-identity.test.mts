import {
  extensionIconPaneBoundsOf,
  faviconLayoutOf,
  faviconPx,
} from '../src/index.mjs';

describe('faviconLayoutOf', () => {
  test('labels the badge with the position, from 1', () => {
    assert.deepStrictEqual(faviconLayoutOf(3).label, '3');

    assert.deepStrictEqual(faviconLayoutOf(0).label, '1');
  });

  // Where an extension's badge sits on its toolbar icon.
  test('puts the badge in the bottom right corner', () => {
    const { badge } = faviconLayoutOf(3);

    assert.deepStrictEqual(badge.x + badge.width, faviconPx);

    assert.deepStrictEqual(badge.y + badge.height, faviconPx);
  });

  test('makes a one-digit badge round', () => {
    const { badge } = faviconLayoutOf(3);

    assert.deepStrictEqual(badge.width, badge.height);

    assert.deepStrictEqual(badge.radius * 2, badge.height);
  });

  test('widens the badge for more digits, within the favicon', () => {
    const one = faviconLayoutOf(3);

    const two = faviconLayoutOf(12);

    const three = faviconLayoutOf(123);

    assert.isTrue(one.badge.width < two.badge.width);

    assert.isTrue(two.badge.width <= three.badge.width);

    assert.isTrue(three.badge.x >= 0);

    assert.isTrue(two.fontPx < one.fontPx);

    assert.isTrue(three.fontPx < two.fontPx);
  });

  test('cuts a gap around the badge', () => {
    const { badge, cutout } = faviconLayoutOf(3);

    assert.isTrue(cutout.x < badge.x);

    assert.isTrue(cutout.y < badge.y);
  });

  // The icon is what tells a split view's tab from any other numbered square,
  // so the badge may hide only the pane under it.
  test('leaves three of the four panes whole under a one-digit badge', () => {
    const { icon, cutout } = faviconLayoutOf(9);

    const [near, nearEnd, far, farEnd] = extensionIconPaneBoundsOf(icon.size);

    const overlapped = [
      [near, nearEnd, near, nearEnd],
      [far, farEnd, near, nearEnd],
      [near, nearEnd, far, farEnd],
      [far, farEnd, far, farEnd],
    ].filter(([x0, x1, y0, y1]) =>
      overlaps(cutout, {
        x: icon.x + (x0 ?? 0),
        y: icon.y + (y0 ?? 0),
        width: (x1 ?? 0) - (x0 ?? 0),
        height: (y1 ?? 0) - (y0 ?? 0),
      }),
    );

    assert.deepStrictEqual(overlapped, [[far, farEnd, far, farEnd]]);
  });

  test.each([1, 10, 100])(
    'leaves the top left pane whole at position %i',
    (position) => {
      const { icon, cutout } = faviconLayoutOf(position);

      const [near, nearEnd] = extensionIconPaneBoundsOf(icon.size);

      assert.isFalse(
        overlaps(cutout, {
          x: icon.x + near,
          y: icon.y + near,
          width: nearEnd - near,
          height: nearEnd - near,
        }),
      );
    },
  );
});

type Rect = Readonly<{ x: number; y: number; width: number; height: number }>;

const overlaps = (a: Rect, b: Rect): boolean =>
  a.x < b.x + b.width &&
  b.x < a.x + a.width &&
  a.y < b.y + b.height &&
  b.y < a.y + a.height;
