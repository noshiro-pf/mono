import { splitToPathSegments } from './split-path-segments.mjs';

describe('splitToPathSegments', () => {
  test('splits simple path', () => {
    assert.deepStrictEqual(splitToPathSegments('/products'), ['products']);
  });

  test('splits nested path', () => {
    assert.deepStrictEqual(splitToPathSegments('/products/123/reviews'), [
      'products',
      '123',
      'reviews',
    ]);
  });

  test('handles root path', () => {
    assert.deepStrictEqual(splitToPathSegments('/'), []);
  });

  test('handles empty string', () => {
    assert.deepStrictEqual(splitToPathSegments(''), []);
  });

  test('handles trailing slash', () => {
    assert.deepStrictEqual(splitToPathSegments('/products/'), ['products']);
  });

  test('handles multiple slashes', () => {
    assert.deepStrictEqual(splitToPathSegments('//products///reviews//'), [
      'products',
      'reviews',
    ]);
  });
});
