import { createElementWithId, getElementById } from './browser-only-apis.mjs';

describe('browser-only-apis', () => {
  test(createElementWithId, () => {
    createElementWithId('aaa');

    const result = getElementById('aaa');

    expect(result).toBeDefined();
  });

  test('environment', () => {
    // eslint-disable-next-line vitest/prefer-expect-type-of, unicorn/prefer-global-this
    expect(typeof window).not.toBe('undefined');
  });
});
