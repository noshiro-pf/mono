import * as path from 'node:path';

export const pathJoin = (...paths: readonly string[]): string =>
  path.join(...paths);

if (import.meta.vitest !== undefined) {
  test('environment', () => {
    // eslint-disable-next-line vitest/prefer-expect-type-of
    expect(typeof process).toBe('object');
  });
}
