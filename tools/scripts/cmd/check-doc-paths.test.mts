import dedent from 'dedent';
import { toTree } from '../lib/repo-files.mjs';
import {
  findPathReferences,
  isResolved,
  judgeDocument,
  readDeclaredAbsent,
  type PathReference,
} from './check-doc-paths.mjs';

const tree = toTree([
  'CLAUDE.md',
  '.github/workflows/ci.yml',
  'docs/a.md',
  'libs/pkg/package.json',
  'libs/pkg/README.md',
  'libs/pkg/src/index.mts',
  'libs/pkg/docs/notes/b.md',
  'libs/pkg/docs/notes/assets/c.png',
  'apps/site/package.json',
  'apps/site/src/content/docs/page.md',
  'experimental/packages/old/README.md',
]);

const writtenIn = (
  text: string,
  relativePath = 'libs/pkg/README.md',
): readonly string[] =>
  findPathReferences(text, relativePath, tree).map(({ written }) => written);

describe('findPathReferences', () => {
  test('reads a path from the root, the package and the directory', () => {
    assert.deepStrictEqual(
      findPathReferences(
        'See `docs/a.md`, `src/index.mts` and `assets/c.png`.',
        'libs/pkg/docs/notes/b.md',
        tree,
      ),
      [
        { line: 1, written: 'docs/a.md', candidates: fromEach('docs/a.md') },
        {
          line: 1,
          written: 'src/index.mts',
          candidates: fromEach('src/index.mts'),
        },
        {
          line: 1,
          written: 'assets/c.png',
          candidates: fromEach('assets/c.png'),
        },
      ],
    );
  });

  test('reads a document beside its package.json from two places', () => {
    assert.deepStrictEqual(
      findPathReferences('`docs/gone.md`', 'libs/pkg/README.md', tree).map(
        ({ candidates }) => candidates,
      ),
      [['docs/gone.md', 'libs/pkg/docs/gone.md']],
    );
  });

  test('reads a document at the root from the root alone', () => {
    assert.deepStrictEqual(
      findPathReferences('`docs/gone.md`', 'CLAUDE.md', tree).map(
        ({ candidates }) => candidates,
      ),
      [['docs/gone.md']],
    );
  });

  test('leaves a path into experimental/ alone', () => {
    assert.deepStrictEqual(
      writtenIn('`experimental/packages/old/README.md` `experimental/gone`'),
      [],
    );
  });

  test('reads a path with a dot-named first segment', () => {
    assert.deepStrictEqual(writtenIn('`.github/workflows/ci.yml`'), [
      '.github/workflows/ci.yml',
    ]);
  });

  test('drops a trailing slash, line number or anchor', () => {
    assert.deepStrictEqual(
      writtenIn(
        '`libs/pkg/src/` `src/index.mts:12` `src/index.mts:12:3` `docs/a.md#x` `docs/a.md#見出し`',
      ),
      [
        'libs/pkg/src',
        'src/index.mts',
        'src/index.mts',
        'docs/a.md',
        'docs/a.md',
      ],
    );
  });

  test('leaves one segment alone, which is there wherever it is read', () => {
    assert.deepStrictEqual(writtenIn('`src/` `docs` `libs/`'), []);
  });

  test('leaves what is not one path alone', () => {
    assert.deepStrictEqual(
      writtenIn(
        [
          '`package.json`',
          '`src/**/*.mts`',
          '`libs/<name>/README.md`',
          '`libs/{name}/README.md`',
          '`pnpm run src/x`',
          '`libs/pkg/.../x.mts`',
          '`https://example.com/docs/a.md`',
          '`/docs/a.md`',
          '`docs//a.md`',
        ].join(' '),
      ),
      [],
    );
  });

  test('leaves a path written from the current directory alone', () => {
    assert.deepStrictEqual(writtenIn("`./src/gone.mts` `'../docs/gone'`"), []);

    assert.deepStrictEqual(writtenIn('`./src/gone.mts` `../docs/gone.md`'), []);
  });

  test('leaves a path whose first segment is nowhere alone', () => {
    assert.deepStrictEqual(
      writtenIn('`noshiro-pf/mono` `@types/node` `origin/main` `test/x.mts`'),
      [],
    );
  });

  test('reads a site page from the root only', () => {
    assert.deepStrictEqual(
      findPathReferences(
        '`src/main.mts` and `docs/a.md`',
        'apps/site/src/content/docs/page.md',
        tree,
      ),
      [{ line: 1, written: 'docs/a.md', candidates: ['docs/a.md'] }],
    );
  });

  test('leaves fenced code alone, in a list item too', () => {
    assert.deepStrictEqual(
      writtenIn(dedent`
        \`src/a.mts\`

        \`\`\`sh
        cat \`src/b.mts\`
        \`\`\`

        - item

          ~~~~md
          \`src/c.mts\`
          ~~~
          \`src/d.mts\`
          ~~~~

        \`src/e.mts\`
      `),
      ['src/a.mts', 'src/e.mts'],
    );
  });

  test('a fence with an info string does not close one', () => {
    assert.deepStrictEqual(
      writtenIn(dedent`
        \`\`\`md
        \`src/a.mts\`
        \`\`\`ts
        \`src/b.mts\`
        \`\`\`
        \`src/c.mts\`
      `),
      ['src/c.mts'],
    );
  });

  test('reads a span delimited by two backticks', () => {
    assert.deepStrictEqual(writtenIn('`` src/a.mts `` and ``x`y``'), [
      'src/a.mts',
    ]);
  });

  test('gives the 1-based line of each path', () => {
    assert.deepStrictEqual(
      findPathReferences(
        'one\n\n`src/index.mts`',
        'libs/pkg/README.md',
        tree,
      ).map(({ line }) => line),
      [3],
    );
  });
});

describe('readDeclaredAbsent', () => {
  test('reads every declaration, each path once per mention', () => {
    assert.deepStrictEqual(
      readDeclaredAbsent(dedent`
        <!-- doc-paths-ignore: src/a.mts docs/b.md -->

        text

        <!--doc-paths-ignore:src/c.mts-->
      `),
      ['src/a.mts', 'docs/b.md', 'src/c.mts'],
    );
  });

  test('reads nothing from an ordinary comment', () => {
    assert.deepStrictEqual(readDeclaredAbsent('<!-- cspell:ignore x -->'), []);
  });

  test('reads a declaration wrapped across lines, normalized as a span is', () => {
    assert.deepStrictEqual(
      readDeclaredAbsent(dedent`
        <!--
          doc-paths-ignore: test/fixtures/netmeme/
          docs/a.md#heading
        -->
      `),
      ['test/fixtures/netmeme', 'docs/a.md'],
    );
  });

  test('reads nothing from a declaration shown as code', () => {
    assert.deepStrictEqual(
      readDeclaredAbsent(dedent`
        Declare it: \`<!-- doc-paths-ignore: <path> -->\`.

        \`\`\`md
        <!-- doc-paths-ignore: src/a.mts -->
        \`\`\`
      `),
      [],
    );
  });
});

describe('isResolved', () => {
  test('is true when any one of the candidates is in the tree', () => {
    assert.isTrue(
      isResolved(
        reference('src/index.mts', ['src/index.mts', 'libs/pkg/src/index.mts']),
        tree,
      ),
    );

    assert.isTrue(isResolved(reference('libs/pkg/src'), tree));

    assert.isFalse(isResolved(reference('docs/gone.md'), tree));
  });
});

describe('judgeDocument', () => {
  test('reports a path that resolves nowhere', () => {
    const gone = reference('docs/gone.md');

    assert.deepStrictEqual(
      judgeDocument({
        unresolved: [gone],
        declared: [],
        gitIgnored: new Set<string>(),
      }),
      { broken: [gone], staleDeclarations: [] },
    );
  });

  test('accepts a path git ignores from any one place', () => {
    assert.deepStrictEqual(
      judgeDocument({
        unresolved: [
          reference('docs/index.html', [
            'docs/index.html',
            'libs/pkg/docs/index.html',
          ]),
        ],
        declared: [],
        gitIgnored: new Set<string>(['libs/pkg/docs/index.html']),
      }),
      { broken: [], staleDeclarations: [] },
    );
  });

  test('accepts a declared path, and reports a declaration excusing nothing', () => {
    assert.deepStrictEqual(
      judgeDocument({
        unresolved: [reference('docs/gone.md'), reference('libs/pkg/dist/a')],
        declared: ['docs/gone.md', 'libs/pkg/dist/a', 'docs/unmentioned.md'],
        gitIgnored: new Set<string>(['libs/pkg/dist/a']),
      }),
      {
        broken: [],
        staleDeclarations: ['libs/pkg/dist/a', 'docs/unmentioned.md'],
      },
    );
  });
});

const reference = (
  written: string,
  candidates: readonly string[] = [written],
): PathReference => ({ line: 1, written, candidates }) as const;

/** A path read from the root, `libs/pkg/` and `libs/pkg/docs/notes/`. */
const fromEach = (written: string): readonly string[] =>
  [written, `libs/pkg/${written}`, `libs/pkg/docs/notes/${written}`] as const;
