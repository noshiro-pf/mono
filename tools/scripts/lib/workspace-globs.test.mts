import dedent from 'dedent';
import { Result } from 'ts-data-forge';
import { parseWorkspacePackages } from './workspace-globs.mjs';

describe(parseWorkspacePackages, () => {
  test('reads the packages list, skipping comments and blank lines', () => {
    const result = parseWorkspacePackages(dedent`
      catalog:
        vite: 8.3.5

      packages:
        - libs/*
        # A comment between entries.
        - 'apps/*'

        - "strict-lib/v*/output/lib"
        - '!**/test/**' # trailing comment

      update:
        githubActions: false
    `);

    assert.isTrue(Result.isOk(result));

    assert.deepStrictEqual(result.value, [
      'libs/*',
      'apps/*',
      'strict-lib/v*/output/lib',
      '!**/test/**',
    ]);
  });

  test('reads CRLF line endings, an unindented list and a quoted #', () => {
    const result = parseWorkspacePackages(
      [
        'packages: # members',
        '- libs/* # note',
        "- 'apps/x #1'",
        'update:',
        '',
      ].join('\r\n'),
    );

    assert.isTrue(Result.isOk(result));

    assert.deepStrictEqual(result.value, ['libs/*', 'apps/x #1']);
  });

  test('fails on a quoted value with escapes it does not decode', () => {
    const result = parseWorkspacePackages(dedent`
      packages:
        - 'it''s/*'
    `);

    assert.isTrue(Result.isErr(result));
  });

  test.each([
    ['a comment where the value should be', '  - #foo'],
    ['a mapping', '  - a: b'],
    ['an alias', '  - *x'],
    ['an unquoted tag', '  - !**/test/**'],
    ['a continuation line', '  - libs/*\n    more'],
    ['a mapping with a null value', '  - libs/*:'],
    ['tab indentation', '\t- libs/*'],
    ['a comment with no space after a quote', "  - 'libs/*'#c"],
  ])('fails on %s', (_, items) => {
    const result = parseWorkspacePackages(`packages:\n${items}\n`);

    assert.isTrue(Result.isErr(result));
  });

  test('fails when there is no packages key', () => {
    const result = parseWorkspacePackages(dedent`
      catalog:
        vite: 8.3.5
    `);

    assert.isTrue(Result.isErr(result));
  });

  test('fails on a flow sequence it cannot read', () => {
    const result = parseWorkspacePackages(dedent`
      packages: [libs/*, apps/*]
    `);

    assert.isTrue(Result.isErr(result));
  });

  test('fails on a line in the list that is not an entry', () => {
    const result = parseWorkspacePackages(dedent`
      packages:
        - libs/*
        apps/*
    `);

    assert.isTrue(Result.isErr(result));
  });

  test('fails on an empty list', () => {
    const result = parseWorkspacePackages(dedent`
      packages:

      update:
        githubActions: false
    `);

    assert.isTrue(Result.isErr(result));
  });
});
