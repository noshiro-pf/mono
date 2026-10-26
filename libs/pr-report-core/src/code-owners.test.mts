import dedent from 'dedent';
import { codeOwnerReview, ownersOf, parseCodeOwners } from './code-owners.mjs';

describe(parseCodeOwners, () => {
  test('reads a pattern and its owners, skipping comments and blank lines', () => {
    assert.deepStrictEqual(
      parseCodeOwners(dedent`
        # The gate.
        /.github/workflows/ @noshiro-pf

        *.md @docs-owner @other # trailing comment
      `),
      [
        { pattern: '/.github/workflows/', owners: ['noshiro-pf'] },
        { pattern: '*.md', owners: ['docs-owner', 'other'] },
      ],
    );
  });

  test('keeps a pattern with no owners, which clears the ones before it', () => {
    assert.deepStrictEqual(parseCodeOwners('/docs/generated/\n'), [
      { pattern: '/docs/generated/', owners: [] },
    ]);
  });
});

describe(ownersOf, () => {
  test('an anchored directory owns everything under it and nothing beside it', () => {
    const rules = '/.github/workflows/ @a';

    assert.deepStrictEqual(owners(rules, '.github/workflows/release.yml'), [
      'a',
    ]);

    assert.deepStrictEqual(owners(rules, '.github/workflows/x/y.yml'), ['a']);

    assert.deepStrictEqual(owners(rules, '.github/CODEOWNERS'), []);

    assert.deepStrictEqual(owners(rules, 'x/.github/workflows/a.yml'), []);
  });

  test('an anchored file owns that file only', () => {
    const rules = '/.github/CODEOWNERS @a';

    assert.deepStrictEqual(owners(rules, '.github/CODEOWNERS'), ['a']);

    assert.deepStrictEqual(owners(rules, 'docs/.github/CODEOWNERS'), []);
  });

  test('an unanchored name matches at any depth', () => {
    const rules = 'apps/ @a';

    assert.deepStrictEqual(owners(rules, 'apps/x.ts'), ['a']);

    assert.deepStrictEqual(owners(rules, 'src/apps/x.ts'), ['a']);

    assert.deepStrictEqual(owners(rules, 'apps'), []);
  });

  test('a single star stays inside one directory', () => {
    const rules = 'docs/* @a';

    assert.deepStrictEqual(owners(rules, 'docs/intro.md'), ['a']);

    assert.deepStrictEqual(owners(rules, 'docs/build/intro.md'), []);
  });

  test('an extension pattern matches anywhere', () => {
    assert.deepStrictEqual(owners('*.js @a', 'src/deep/x.js'), ['a']);

    assert.deepStrictEqual(owners('*.js @a', 'src/deep/x.mjs'), []);
  });

  test('a double star crosses directories', () => {
    const rules = '/libs/**/package.json @a';

    assert.deepStrictEqual(owners(rules, 'libs/package.json'), ['a']);

    assert.deepStrictEqual(owners(rules, 'libs/x/y/package.json'), ['a']);

    assert.deepStrictEqual(owners(rules, 'apps/x/package.json'), []);
  });

  test('the last matching pattern wins, including one with no owners', () => {
    const rules = dedent`
      /docs/ @a
      /docs/generated/
      /docs/generated/keep.md @b
    `;

    assert.deepStrictEqual(owners(rules, 'docs/intro.md'), ['a']);

    assert.deepStrictEqual(owners(rules, 'docs/generated/api.md'), []);

    assert.deepStrictEqual(owners(rules, 'docs/generated/keep.md'), ['b']);
  });

  test('the dots in a pattern are literal', () => {
    assert.deepStrictEqual(owners('/a.b @a', 'axb'), []);
  });
});

describe(codeOwnerReview, () => {
  const rules = parseCodeOwners(dedent`
    /.github/workflows/ @noshiro-pf
    /repo-settings/ @noshiro-pf @other
  `);

  const review = (
    overrides: Partial<Parameters<typeof codeOwnerReview>[0]>,
  ): ReturnType<typeof codeOwnerReview> =>
    codeOwnerReview({
      required: true,
      rules,
      files: ['.github/workflows/release.yml', 'libs/x/src/a.mts'],
      filesComplete: true,
      approvers: [],
      author: 'renovate-bot',
      ...overrides,
    });

  test('asks for nothing when the ruleset does not', () => {
    assert.deepStrictEqual(review({ required: false }), {
      state: 'not-required',
    });
  });

  test('asks for nothing when no changed path is owned', () => {
    assert.deepStrictEqual(review({ files: ['libs/x/src/a.mts'] }), {
      state: 'not-required',
    });
  });

  test('waits on the owned paths nobody has approved, and names who can', () => {
    assert.deepStrictEqual(review({}), {
      state: 'required',
      paths: ['.github/workflows/release.yml'],
      owners: ['noshiro-pf'],
      authorOwns: false,
    });
  });

  test('is satisfied by any one owner of each path, whatever the case', () => {
    assert.deepStrictEqual(
      review({
        files: ['.github/workflows/a.yml', 'repo-settings/rulesets/main.json'],
        approvers: ['Noshiro-PF'],
      }),
      { state: 'approved' },
    );

    assert.deepStrictEqual(
      review({
        files: ['repo-settings/rulesets/main.json'],
        approvers: ['other'],
      }),
      { state: 'approved' },
    );
  });

  test('says when the author is an owner, since they cannot approve it', () => {
    const answered = review({ author: 'noshiro-pf' });

    assert.isTrue(answered.state === 'required' && answered.authorOwns);
  });

  test('cannot tell when the files it did not read might be owned', () => {
    assert.deepStrictEqual(
      review({ files: ['libs/x/src/a.mts'], filesComplete: false }),
      { state: 'unknown' },
    );
  });

  test('still reports a wait it has already found in a partial list', () => {
    assert.strictEqual(review({ filesComplete: false }).state, 'required');
  });

  describe('a team owner', () => {
    const teamRules = parseCodeOwners(dedent`
      /docs/ @org/docs-team
      /src/ @org/core @noshiro-pf
    `);

    test('waits on a path it owns while nobody has approved at all', () => {
      assert.deepStrictEqual(
        review({ rules: teamRules, files: ['docs/a.md'] }),
        {
          state: 'required',
          paths: ['docs/a.md'],
          owners: ['org/docs-team'],
          authorOwns: false,
        },
      );
    });

    // Telling who is on a team takes `read:org`, which no reader asks for.
    test('cannot tell whether an approval came from someone on it', () => {
      assert.deepStrictEqual(
        review({ rules: teamRules, files: ['docs/a.md'], approvers: ['x'] }),
        { state: 'unknown', teams: ['org/docs-team'] },
      );
    });

    test('is not needed once a person it shares the path with approves', () => {
      assert.deepStrictEqual(
        review({
          rules: teamRules,
          files: ['src/a.mts'],
          approvers: ['noshiro-pf'],
        }),
        { state: 'approved' },
      );
    });

    test('leaves a wait found on another path standing', () => {
      assert.deepStrictEqual(
        review({
          rules: parseCodeOwners(dedent`
            /docs/ @org/docs-team
            /.github/ @noshiro-pf
          `),
          files: ['docs/a.md', '.github/x.yml'],
          approvers: ['x'],
        }),
        {
          state: 'required',
          paths: ['.github/x.yml'],
          owners: ['noshiro-pf'],
          authorOwns: false,
        },
      );
    });
  });
});

const owners = (text: string, path: string): readonly string[] =>
  ownersOf(path, parseCodeOwners(text));
