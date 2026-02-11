import { length, size } from './array-utils-size.mjs';

describe('size/length', () => {
  test('size should return the array length', () => {
    const array = [1, 2, 3] as const;

    expect(size(array)).toBe(array.length);

    expect(length(array)).toBe(3);
  });
});
