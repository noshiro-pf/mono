import { Yen } from '../types/index.mjs';
import { formatYen } from './format-yen.mjs';

describe(formatYen, () => {
  test('writes a figure in yen, rounded to the yen', () => {
    expect(formatYen(Yen.cast(1_234_567.4))).toBe('￥1,234,567');
  });

  // A balance that ends a hair below 0, or at `-0`, is nothing owed.
  test.each([-0, -1e-9, -0.4])(
    'writes %s, which rounds to 0, unsigned',
    (value) => {
      expect(formatYen(Yen.cast(value))).toBe('￥0');
    },
  );

  test.each([
    [-0.5, '-￥1'],
    [-3, '-￥3'],
  ])('keeps the sign of %s, which rounds away from 0', (value, expected) => {
    expect(formatYen(Yen.cast(value))).toBe(expected);
  });
});
