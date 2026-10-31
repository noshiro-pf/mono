import dedent from 'dedent';
import { toTree } from '../lib/repo-files.mjs';
import {
  brokenReason,
  findMonoLinks,
  type MonoLink,
} from './check-mono-links.mjs';

const BASE = 'https://github.com/noshiro-pf/mono';

const targetsOf = (
  text: string,
  relativePath = 'libs/synstate/README.md',
): readonly string[] =>
  findMonoLinks(text, relativePath).map((link) => link.target);

const linkTo = (
  target: string,
  lines?: Readonly<{ first: number; last: number }>,
): MonoLink => ({ line: 1, written: target, target, lines }) as const;

describe('findMonoLinks', () => {
  test('reads blob, tree, raw and edit URLs on main', () => {
    assert.deepStrictEqual(
      targetsOf(dedent`
        [a](${BASE}/blob/main/libs/synstate/src/a.mts)
        [b](${BASE}/tree/main/libs/synstate/)
        <img src="${BASE}/raw/main/libs/synstate/assets/logo.png" />
        ${BASE}/edit/main/libs/synstate/README.md.
      `),
      [
        'libs/synstate/src/a.mts',
        'libs/synstate',
        'libs/synstate/assets/logo.png',
        'libs/synstate/README.md',
      ],
    );
  });

  test('reads URLs inside code, where the docs site builds its links', () => {
    assert.deepStrictEqual(
      targetsOf(
        `const url = '${BASE}/blob/main/libs/synstate/src/a.mts';`,
        'apps/synstate-docs/scripts/embed.mts',
      ),
      ['libs/synstate/src/a.mts'],
    );
  });

  test('leaves URLs pinned to a commit or another branch alone', () => {
    assert.deepStrictEqual(
      targetsOf(dedent`
        ${BASE}/blob/282de895074789a85912c618d6ae69ac49c2730d/gone.mts
        ${BASE}/blob/develop/gone.mts
        ${BASE}/pull/2052
      `),
      [],
    );
  });

  test('leaves templates alone', () => {
    assert.deepStrictEqual(
      targetsOf(dedent`
        ${BASE}/blob/main/{path}#L{line}
        \`${BASE}/blob/main/\${file}\`
      `),
      [],
    );
  });

  test('decodes the path', () => {
    assert.deepStrictEqual(targetsOf(`${BASE}/blob/main/docs/a%20b.md`), [
      'docs/a b.md',
    ]);
  });

  test('reads a line anchor and a line range', () => {
    const lines = findMonoLinks(
      dedent`
        ${BASE}/blob/main/a.mts#L10
        ${BASE}/blob/main/a.mts#L10-L20
        ${BASE}/blob/main/a.mts#L10C3-L20C8
        ${BASE}/blob/main/a.md#readme
        ${BASE}/blob/main/a.mts#L10-L20-L30
        ${BASE}/blob/main/a.mts#L10x
      `,
      'libs/synstate/README.md',
    ).map((link) => link.lines);

    assert.deepStrictEqual(lines, [
      { first: 10, last: 10 },
      { first: 10, last: 20 },
      { first: 10, last: 20 },
      undefined,
      undefined,
      undefined,
    ]);
  });

  test('resolves a relative Markdown link from the file it is in', () => {
    assert.deepStrictEqual(
      targetsOf(
        dedent`
          See [SynState](../../libs/synstate) and [the spec](./SPEC.md#scope).
          [site](https://example.com) and [anchor](#here) are not read.
        `,
        'apps/synstate-docs/README.md',
      ),
      ['libs/synstate', 'apps/synstate-docs/SPEC.md'],
    );
  });

  test('resolves a relative link with no leading ./, in any document', () => {
    assert.deepStrictEqual(
      targetsOf(
        dedent`
          [design](docs/design.md) and ![logo](assets/logo.png).
          [mail](mailto:a@example.com), [route](/guides/) and [x](<a b.md>).
        `,
        'tools/configs/README.md',
      ),
      ['tools/configs/docs/design.md', 'tools/configs/assets/logo.png'],
    );
  });

  test('leaves the relative links of the docs site pages alone', () => {
    assert.deepStrictEqual(
      targetsOf(
        '[map](../map/)',
        'apps/synstate-docs/src/content/docs/reference/api.md',
      ),
      [],
    );

    assert.deepStrictEqual(
      targetsOf(
        '[map](../map/)',
        'apps/synstate-dom-docs/src/content/docs/reference/api.md',
      ),
      [],
    );
  });

  test('leaves a relative link written as code alone', () => {
    assert.deepStrictEqual(
      targetsOf(dedent`
        Write \`[x](./gone.md)\`, not [y](./README.md).

        \`\`\`ts
        handlers[0](value);
        \`\`\`
      `),
      ['libs/synstate/README.md'],
    );
  });

  test('leaves the relative links of a record alone', () => {
    assert.deepStrictEqual(
      targetsOf('[old](./gone.mts)', 'libs/synstate/CHANGELOG.md'),
      [],
    );

    assert.deepStrictEqual(
      targetsOf('[old](./gone.mts)', 'strict-lib/docs/work-log/a.md'),
      [],
    );
  });

  test('leaves relative paths outside Markdown alone', () => {
    assert.deepStrictEqual(
      targetsOf(
        "import x from './x.mjs'; // ](./y.mts)",
        'libs/synstate/a.mts',
      ),
      [],
    );
  });

  test('gives the 1-based line of each link', () => {
    assert.deepStrictEqual(
      findMonoLinks(
        dedent`
          first

          ${BASE}/blob/main/a.mts
        `,
        'libs/synstate/README.md',
      ).map((link) => link.line),
      [3],
    );
  });
});

describe('brokenReason', () => {
  const tree = toTree(['libs/synstate/README.md', 'libs/synstate/src/a.mts']);

  test('accepts a tracked file and a directory that holds one', async () => {
    assert.isUndefined(
      await brokenReason(
        linkTo('libs/synstate/src/a.mts'),
        tree,
        new Map<string, number>(),
      ),
    );

    assert.isUndefined(
      await brokenReason(
        linkTo('libs/synstate/src'),
        tree,
        new Map<string, number>(),
      ),
    );

    assert.isUndefined(
      await brokenReason(linkTo('libs'), tree, new Map<string, number>()),
    );
  });

  test('rejects a path the tree does not have', async () => {
    assert.strictEqual(
      await brokenReason(
        linkTo('libs/synstate/src/b.mts'),
        tree,
        new Map<string, number>(),
      ),
      'no such path on main',
    );

    // A prefix of a file name is not a directory.
    assert.strictEqual(
      await brokenReason(
        linkTo('libs/synstate/src/a'),
        tree,
        new Map<string, number>(),
      ),
      'no such path on main',
    );
  });

  test('checks a line anchor against the length of the file', async () => {
    const lineCounts = new Map<string, number>([
      ['libs/synstate/src/a.mts', 20],
    ]);

    assert.isUndefined(
      await brokenReason(
        linkTo('libs/synstate/src/a.mts', { first: 10, last: 20 }),
        tree,
        lineCounts,
      ),
    );

    assert.strictEqual(
      await brokenReason(
        linkTo('libs/synstate/src/a.mts', { first: 10, last: 21 }),
        tree,
        lineCounts,
      ),
      'line 21 is past the end of the file (20 lines)',
    );
  });

  test('rejects a line anchor on a directory', async () => {
    assert.strictEqual(
      await brokenReason(
        linkTo('libs/synstate/src', { first: 1, last: 1 }),
        tree,
        new Map<string, number>(),
      ),
      'a line anchor on a directory',
    );
  });
});
