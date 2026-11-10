import dedent from 'dedent';
import {
  findFenceRegexes,
  judgeFenceRegexes,
} from './check-markdown-fence-readers.mjs';

describe('findFenceRegexes', () => {
  test('finds a literal that repeats a backtick or a tilde', () => {
    assert.deepStrictEqual(
      findFenceRegexes(dedent`
        const A = /^\s*(\`{3,}|~{3,})/u;
        const B = /^~{3}/u;
      `).map(({ line }) => line),
      [1, 2],
    );
  });

  test('finds a fence written out, escaped or not', () => {
    assert.deepStrictEqual(
      findFenceRegexes(
        [
          'const A = /^```ts$/u;',
          'const B = /^\\`\\`\\`/u;',
          'const C = /^~~~/u;',
        ].join('\n'),
      ).map(({ line }) => line),
      [1, 2, 3],
    );
  });

  test('finds a string handed to new RegExp', () => {
    assert.deepStrictEqual(
      findFenceRegexes(dedent`
        const A = new RegExp('^\`{3,}', 'u');
        const B = RegExp(\`^~{3,}\`);
      `).map(({ line }) => line),
      [1, 2],
    );
  });

  test('leaves other regular expressions and fence strings alone', () => {
    assert.deepStrictEqual(
      findFenceRegexes(dedent`
        const A = /^\`[^\`]+\`$/u;
        const B = /\`{2}/u;
        const C = '\`\`\`ts';
        const D = new RegExp(pattern, 'u');
      `),
      [],
    );
  });
});

describe('judgeFenceRegexes', () => {
  const found = [
    { file: 'tools/a.mts', line: 1, source: '/^```/u' },
    { file: 'tools/a.mts', line: 2, source: '/^~~~/u' },
  ] as const;

  test('exempts an expression by its file and its text alone', () => {
    const { offenders, staleExemptions } = judgeFenceRegexes(found, [
      { file: 'tools/a.mts', source: '/^```/u', reason: 'not a reader' },
    ]);

    assert.deepStrictEqual(offenders, [found[1]]);

    assert.deepStrictEqual(staleExemptions, []);
  });

  test('reports an exemption that exempts nothing', () => {
    const { staleExemptions } = judgeFenceRegexes(found, [
      { file: 'tools/b.mts', source: '/^```/u', reason: 'not a reader' },
    ]);

    expect(staleExemptions).toHaveLength(1);
  });
});
