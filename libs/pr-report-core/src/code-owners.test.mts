import dedent from 'dedent';
import {
  codeOwnerGate,
  codeOwnerReview,
  codeOwnersEnforcedBy,
  namesEveryChangedPath,
  ownersOf,
  parseCodeOwners,
  pushersOf,
  type BranchActivity,
} from './code-owners.mjs';

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

  test('counts the author as approving what they own when asked to', () => {
    assert.deepStrictEqual(
      review({ author: 'NoShiro-PF', authorApproves: true }),
      { state: 'approved' },
    );

    assert.deepStrictEqual(
      review({ author: 'renovate-bot', authorApproves: true }),
      {
        state: 'required',
        paths: ['.github/workflows/release.yml'],
        owners: ['noshiro-pf'],
        authorOwns: false,
      },
    );
  });

  // The author stands for what they own only as far as they wrote it: a commit
  // someone else pushed to their branch is that person's.
  describe('with who pushed to the branch', () => {
    test('counts the author where every pusher owns the path', () => {
      assert.deepStrictEqual(
        review({
          author: 'noshiro-pf',
          authorApproves: true,
          pushers: ['NoShiro-PF'],
        }),
        { state: 'approved' },
      );
    });

    test('waits where someone who owns nothing pushed', () => {
      assert.deepStrictEqual(
        review({
          author: 'noshiro-pf',
          authorApproves: true,
          pushers: ['noshiro-pf', 'helper-bot'],
        }),
        {
          state: 'required',
          paths: ['.github/workflows/release.yml'],
          owners: ['noshiro-pf'],
          authorOwns: true,
        },
      );
    });

    test('waits where who pushed cannot be told', () => {
      assert.strictEqual(
        review({
          author: 'noshiro-pf',
          authorApproves: true,
          pushers: 'unknown',
        }).state,
        'required',
      );
    });

    test('is satisfied by another owner’s approval as ever', () => {
      assert.deepStrictEqual(
        review({
          files: ['repo-settings/a.json'],
          author: 'noshiro-pf',
          authorApproves: true,
          pushers: ['helper-bot'],
          approvers: ['other'],
        }),
        { state: 'approved' },
      );
    });
  });

  // An approval by someone else might be a team member's; the author's own
  // standing is no approval at all, so a team path still waits for one.
  test('counts the author only on the paths they own, not as an approver', () => {
    assert.deepStrictEqual(
      codeOwnerReview({
        required: true,
        rules: parseCodeOwners('/infra/ @org/team\n/docs/ @bot\n'),
        files: ['infra/x.tf', 'docs/a.md'],
        filesComplete: true,
        approvers: [],
        author: 'bot',
        authorApproves: true,
      }),
      {
        state: 'required',
        paths: ['infra/x.tf'],
        owners: ['org/team'],
        authorOwns: false,
      },
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

  // Whatever the unread paths are, no owner could still be waiting on them.
  test('settles a partial list when every owner the file names is satisfied', () => {
    assert.deepStrictEqual(
      review({
        filesComplete: false,
        approvers: ['noshiro-pf'],
        rules: parseCodeOwners('/.github/workflows/ @noshiro-pf\n'),
      }),
      { state: 'approved' },
    );

    assert.deepStrictEqual(
      review({
        files: ['libs/x/src/a.mts'],
        filesComplete: false,
        author: 'noshiro-pf',
        authorApproves: true,
        rules: parseCodeOwners('/.github/workflows/ @noshiro-pf\n'),
      }),
      { state: 'not-required' },
    );

    // `@other` alone owns a rule nobody has satisfied.
    assert.deepStrictEqual(
      review({
        filesComplete: false,
        approvers: ['noshiro-pf'],
        rules: parseCodeOwners('/.github/workflows/ @noshiro-pf\n/x/ @other\n'),
      }),
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

describe(pushersOf, () => {
  const zero = '0'.repeat(40);

  test('names everyone who pushed since the branch was last created', () => {
    assert.deepStrictEqual(
      pushersOf(
        [
          activity('push', 'o1', 'o2', 'stranger'),
          activity('branch_deletion', 'o2', zero, 'stranger'),
          activity('branch_creation', zero, 'a', 'owner'),
          activity('push', 'a', 'b', 'helper'),
          activity('force_push', 'b', 'c', 'owner'),
        ],
        'c',
      ),
      ['owner', 'helper'],
    );
  });

  test('cannot tell over a gap, a missing actor, or short of the head', () => {
    const created = activity('branch_creation', zero, 'a', 'owner');

    assert.strictEqual(
      pushersOf([created, activity('push', 'x', 'b', 'owner')], 'b'),
      'unknown',
    );

    assert.strictEqual(
      pushersOf([created, activity('push', 'a', 'b', undefined)], 'b'),
      'unknown',
    );

    assert.strictEqual(pushersOf([created], 'b'), 'unknown');

    assert.strictEqual(
      pushersOf(
        [
          activity('branch_creation', zero, 'a', undefined),
          activity('push', 'a', 'b', 'owner'),
        ],
        'b',
      ),
      'unknown',
    );

    // The creation itself is past what GitHub keeps.
    assert.strictEqual(
      pushersOf([activity('push', 'a', 'b', 'owner')], 'b'),
      'unknown',
    );
  });
});

describe(namesEveryChangedPath, () => {
  test('is false where a rename leaves its old path unnamed', () => {
    assert.isTrue(
      namesEveryChangedPath([
        { changeType: 'MODIFIED' },
        { changeType: 'ADDED' },
        { changeType: 'DELETED' },
      ]),
    );

    assert.isFalse(
      namesEveryChangedPath([
        { changeType: 'MODIFIED' },
        { changeType: 'RENAMED' },
      ]),
    );

    assert.isFalse(namesEveryChangedPath([{ changeType: 'COPIED' }]));
  });
});

describe(codeOwnersEnforcedBy, () => {
  test('reads the context a comment line names', () => {
    assert.strictEqual(
      codeOwnersEnforcedBy(dedent`
        # Owners.
        #
        #   enforced-by:   Validate code owners  
        /.github/ @owner
      `),
      'Validate code owners',
    );
  });

  test('is undefined for a file that names none', () => {
    assert.isUndefined(codeOwnersEnforcedBy('/.github/ @owner\n'));

    assert.isUndefined(codeOwnersEnforcedBy('# enforced-by:\n'));
  });

  test('takes the first of several', () => {
    assert.strictEqual(
      codeOwnersEnforcedBy('# enforced-by: a\n# enforced-by: b\n'),
      'a',
    );
  });

  // The declaration is the file's head, as the file and the job describe it: a
  // comment further down, say one explaining a rule, declares nothing.
  test('reads only the comments before the first rule', () => {
    assert.isUndefined(
      codeOwnersEnforcedBy(dedent`
        # Owners.
        /.github/ @owner

        # enforced-by: a
        /docs/ @owner
      `),
    );

    assert.strictEqual(
      codeOwnersEnforcedBy('\n# Owners.\n\n# enforced-by: a\n/.github/ @o\n'),
      'a',
    );
  });

  // Only a comment line is a declaration; a pattern is never mistaken for one.
  test('ignores the words after a pattern', () => {
    assert.isUndefined(
      codeOwnersEnforcedBy('/docs/ @owner # enforced-by: a\n'),
    );
  });
});

describe(codeOwnerGate, () => {
  test('is the ruleset when the ruleset asks, whatever the file says', () => {
    assert.strictEqual(
      codeOwnerGate(requirements(true, ['a']), 'a'),
      'ruleset',
    );

    assert.strictEqual(
      codeOwnerGate(requirements(true, []), undefined),
      'ruleset',
    );
  });

  test('is the check the file names when the ruleset requires it', () => {
    assert.strictEqual(
      codeOwnerGate(requirements(false, ['x', 'a']), 'a'),
      'check',
    );
  });

  // A file can say anything; only a check the ruleset requires holds a merge.
  test('is nothing when the named check is not required', () => {
    assert.isUndefined(codeOwnerGate(requirements(false, ['x']), 'a'));

    assert.isUndefined(codeOwnerGate(requirements(false, ['a']), undefined));
  });
});

const requirements = (
  requireCodeOwnerReview: boolean,
  requiredContexts: readonly string[],
): Parameters<typeof codeOwnerGate>[0] =>
  ({ requireCodeOwnerReview, requiredContexts }) as const;

const activity = (
  activityType: string,
  before: string,
  after: string,
  actor: string | undefined,
): BranchActivity => ({ activityType, before, after, actor }) as const;
