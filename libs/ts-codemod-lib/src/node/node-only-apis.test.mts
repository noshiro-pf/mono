import { pathJoin } from './node-only-apis.mjs';

describe('node-only-apis', () => {
  test(pathJoin, () => {
    expect(pathJoin('aaa', 'bbb')).toBe('aaa/bbb');
  });

  test('environment', () => {
    // eslint-disable-next-line vitest/prefer-expect-type-of
    expect(typeof process).toBe('object');
  });
});
