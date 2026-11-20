import { findPointers } from './claude-code-public-write-gate.mjs';

// Built from parts, so that this file is no pointer itself.
const PRIVATE_REPO = ['noshiro-pf', 'mono-security'].join('/');

describe(findPointers, () => {
  test('names each line that points into the private repository', () => {
    expect(
      findPointers(
        'docs/a.md',
        [
          `Findings go to \`${PRIVATE_REPO}\`.`,
          `Closes ${PRIVATE_REPO}#13.`,
          'clean',
          `see https://github.com/${PRIVATE_REPO}/issues/2`,
        ].join('\n'),
      ),
    ).toStrictEqual([
      `docs/a.md:2: ${PRIVATE_REPO}#13.`,
      `docs/a.md:4: https://github.com/${PRIVATE_REPO}/issues/2`,
    ]);
  });

  test('reads one line at a time, a wrapped paragraph included', () => {
    expect(
      findPointers('docs/a.md', `Tracked at ${PRIVATE_REPO}\n#13 for now.`),
    ).toStrictEqual([]);
  });

  test('reads UTF-16 text, as UTF-8 decoding leaves it', () => {
    const decoded = Buffer.from(`see ${PRIVATE_REPO}#4\n`, 'utf16le').toString(
      'utf8',
    );

    expect(findPointers('a.txt', decoded)).toStrictEqual([
      `a.txt:1: ${PRIVATE_REPO}#4`,
    ]);
  });

  test('reports a pointer two patterns find once', () => {
    expect(
      findPointers(
        'a.md',
        `https://raw.githubusercontent.com/${PRIVATE_REPO}/blob/x`,
      ),
    ).toStrictEqual([
      `a.md:1: https://raw.githubusercontent.com/${PRIVATE_REPO}/blob/x`,
    ]);
  });

  test('names a path that points into it', () => {
    const file =
      `notes/${['mono-security', 'issues', '42.md'].join('/')}` as const;

    expect(findPointers(file, 'clean')).toStrictEqual([`${file}: ${file}`]);
  });
});
