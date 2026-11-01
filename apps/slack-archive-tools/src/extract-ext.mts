import * as path from 'node:path';

/**
 * The extension of a URL's path, ignoring its query string and fragment.
 *
 * "https://files.slack.com/files-pri/T0/F0/a.jpg?t=xoxe-…" -> ".jpg"
 */
export const extractExt = (url: string): string =>
  path.posix.extname(URL.parse(url)?.pathname ?? url);

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

  test('extractExt without a query string', () => {
    expect(
      extractExt('https://files.slack.com/files-pri/T0/F0/image.png'),
    ).toBe('.png');
  });

  test('extractExt ignores a fragment', () => {
    expect(
      extractExt('https://files.slack.com/files-pri/T0/F0/image.png#x.y'),
    ).toBe('.png');

    expect(
      extractExt('https://files.slack.com/files-pri/T0/F0/doc.pdf?t=a.b#c'),
    ).toBe('.pdf');
  });

  test('extractExt of a path without an extension', () => {
    expect(extractExt('https://files.slack.com/files-pri/T0/F0/README')).toBe(
      '',
    );
  });
}
