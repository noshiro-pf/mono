import {
  collectCitations,
  collectHeadings,
} from './check-claude-md-references.mjs';

describe('collectHeadings', () => {
  test('reads every level of heading and nothing else', () => {
    assert.deepStrictEqual(
      collectHeadings(
        [
          '# CLAUDE.md',
          '',
          'Prose that is not a heading.',
          '',
          '## Repository layout',
          '',
          '### `strict-lib/`',
          '',
          '#not a heading without a space',
          '',
        ].join('\n'),
      ),
      ['# CLAUDE.md', '## Repository layout', '### `strict-lib/`'].map((line) =>
        line.replace(/^#+\s/u, ''),
      ),
    );
  });
});

describe('collectCitations', () => {
  test('reads a heading named after the file', () => {
    assert.deepStrictEqual(
      collectCitations('here (see CLAUDE.md, "Releases") — so a run that'),
      ['Releases'],
    );
  });

  test('reads a run of headings after one mention of the file', () => {
    assert.deepStrictEqual(
      collectCitations(
        'The conventions this reads are `CLAUDE.md`\'s: "Required status checks", "Triggers" and "Build".',
      ),
      ['Required status checks', 'Triggers', 'Build'],
    );
  });

  test('reads a heading named before the file', () => {
    assert.deepStrictEqual(
      collectCitations('See "CI diff gates" in CLAUDE.md.'),
      ['CI diff gates'],
    );

    assert.deepStrictEqual(
      collectCitations('see "Build" in the root `CLAUDE.md`.'),
      ['Build'],
    );
  });

  test('reads a citation that wraps across two comment lines', () => {
    assert.deepStrictEqual(
      collectCitations(
        [
          '  // run before any `dist/` exists. See CLAUDE.md, "Building',
          '  // from a clean checkout".',
        ].join('\n'),
      ),
      ['Building from a clean checkout'],
    );
  });

  test('reads the Japanese form, which the trailing 節 marks', () => {
    assert.deepStrictEqual(
      collectCitations('理由は `CLAUDE.md` の「CI」節。'),
      ['CI'],
    );
  });

  test('leaves a quoted rule alone, because it names no section', () => {
    assert.deepStrictEqual(
      collectCitations(
        '（ CLAUDE.md の「 `skip-ci` を付けてから auto-merge を武装する」を、人の手順ではなく生成側で保証する）',
      ),
      [],
    );

    assert.deepStrictEqual(
      collectCitations(
        'CLAUDE.md が「`pnpm run gen:index` で自動生成せよ」と書いているので',
      ),
      [],
    );
  });

  test('reads what CLAUDE.md points at in itself only when asked', () => {
    const text = 'Documents and comments may be Japanese; see "Zenn".';

    assert.deepStrictEqual(collectCitations(text), []);

    assert.deepStrictEqual(collectCitations(text, { selfReferences: true }), [
      'Zenn',
    ]);
  });

  test('leaves a quoted phrase that is not a pointer alone', () => {
    assert.deepStrictEqual(
      collectCitations(
        'Re-examine a reused failure with "Re-run all jobs", not "Re-run failed jobs".',
        { selfReferences: true },
      ),
      [],
    );
  });
});
