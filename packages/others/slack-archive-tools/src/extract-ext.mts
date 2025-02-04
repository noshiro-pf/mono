import { pipe } from '@noshiro/ts-utils';
import 'zx/globals';

/**
 * ".jpg?t=xoxe-1405110841104-7609868321223-7621542667925-4fad30d9a97ce707dc3984a3607d1bdc"
 * -> ".jpg"
 */
export const extractExt = (url: string): string =>
  pipe(url)
    .chain((s) => path.parse(s).ext)
    .chain((s) => s.slice(0, s.indexOf('?'))).value;

if (import.meta.vitest !== undefined) {
  test('path.parse', () => {
    expect(
      path.parse(
        'https://files.slack.com/files-pri/aaaaaaaaaa/ios__________.jpg?t=xoxe-bbbbbbbbbbbbbbbbbbbb',
      ).ext,
    ).toBe('.jpg?t=xoxe-bbbbbbbbbbbbbbbbbbbb');
  });

  test('extractExt', () => {
    expect(
      extractExt(
        'https://files.slack.com/files-pri/aaaaaaaaaa/ios__________.jpg?t=xoxe-bbbbbbbbbbbbbbbbbbbb',
      ),
    ).toBe('.jpg');
  });
}
