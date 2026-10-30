import dedent from 'dedent';
import { Result } from 'ts-data-forge';
import { formatScreenshotTable, pairScreenshots } from './pr-screenshots.mjs';

const sha = 'a'.repeat(40);

const raw = (path: string): string =>
  `https://raw.githubusercontent.com/noshiro-pf/mono-screenshots/${sha}/12/${path}` as const;

const viewer =
  `https://noshiro-pf.github.io/mono-screenshots/?pr=12&sha=${sha}` as const;

describe('pairScreenshots', () => {
  test('pairs before-<name> with after-<name>, in natural order of the name', () => {
    assert.deepStrictEqual(
      pairScreenshots([
        'after-step-10.png',
        'after-step-2.png',
        'before-step-10.png',
        'before-step-2.png',
      ]),
      {
        rows: [
          {
            name: 'step-2',
            before: 'before-step-2.png',
            after: 'after-step-2.png',
          },
          {
            name: 'step-10',
            before: 'before-step-10.png',
            after: 'after-step-10.png',
          },
        ],
        others: [],
      },
    );
  });

  test('keeps a side that has no counterpart, and the directory in the name', () => {
    assert.deepStrictEqual(
      pairScreenshots([
        'after-new-dialog.png',
        'mobile/before-list.png',
        'mobile/after-list.png',
      ]),
      {
        rows: [
          {
            name: 'mobile/list',
            before: 'mobile/before-list.png',
            after: 'mobile/after-list.png',
          },
          {
            name: 'new-dialog',
            before: undefined,
            after: 'after-new-dialog.png',
          },
        ],
        others: [],
      },
    );
  });

  test('sets aside images without a before- or after- prefix, and non-images', () => {
    assert.deepStrictEqual(
      pairScreenshots(['overview.png', 'notes.txt', 'after-x.webp']),
      {
        rows: [{ name: 'x', before: undefined, after: 'after-x.webp' }],
        others: ['overview.png'],
      },
    );
  });
});

describe('formatScreenshotTable', () => {
  test('links every image to the viewer at its own file, under a link to the whole set', () => {
    const result = formatScreenshotTable({
      pr: 12,
      sha,
      paths: ['before-list.png', 'after-list.png', 'after-new.png'],
    });

    assert.isTrue(Result.isOk(result));

    assert.strictEqual(
      Result.unwrapOkOr(result, ''),
      `${dedent`
        [Open them in the viewer](${viewer})

        |  | Before | After |
        | :-- | :-- | :-- |
        | \`list\` | <a href="${viewer}#before-list.png"><img src="${raw('before-list.png')}" alt="before: list" width="420"></a> | <a href="${viewer}#after-list.png"><img src="${raw('after-list.png')}" alt="after: list" width="420"></a> |
        | \`new\` |  | <a href="${viewer}#after-new.png"><img src="${raw('after-new.png')}" alt="after: new" width="420"></a> |
      `}\n`,
    );
  });

  test('puts the images with no side after the table', () => {
    const result = formatScreenshotTable({
      pr: 12,
      sha,
      paths: ['overview.png'],
    });

    assert.strictEqual(
      Result.unwrapOkOr(result, ''),
      `${dedent`
        [Open them in the viewer](${viewer})

        <a href="${viewer}#overview.png"><img src="${raw('overview.png')}" alt="overview.png" width="420"></a>
      `}\n`,
    );
  });

  test('refuses a file name the viewer link would have to encode', () => {
    const result = formatScreenshotTable({
      pr: 12,
      sha,
      paths: ['after-list.png', 'after-my list.png', 'before-a#b.png'],
    });

    assert.isTrue(Result.isErr(result));

    assert.include(
      Result.isErr(result) ? result.value : '',
      'after-my list.png',
    );

    assert.include(Result.isErr(result) ? result.value : '', 'before-a#b.png');
  });

  test('refuses two images for the same side of one name, rather than drop one', () => {
    const result = formatScreenshotTable({
      pr: 12,
      sha,
      paths: ['after-list.png', 'after-list.webp', 'before-list.png'],
    });

    assert.isTrue(Result.isErr(result));

    assert.include(Result.isErr(result) ? result.value : '', 'after-list.webp');
  });

  test('refuses a directory with no images', () => {
    assert.isTrue(
      Result.isErr(formatScreenshotTable({ pr: 12, sha, paths: ['a.txt'] })),
    );
  });
});
