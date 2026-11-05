import {
  issueThemes,
  orderByTheme,
  primaryThemes,
  themeMatches,
  type ThemedIssue,
} from './themes.mjs';

describe(issueThemes, () => {
  test('reads the scope a title starts with', () => {
    assert.deepStrictEqual(issueThemes('rework-pr: refuse claimed ones', ''), [
      'rework-pr',
    ]);
  });

  test('reads a conventional scope, and several', () => {
    assert.deepStrictEqual(
      issueThemes('fix(life-plan-simulator): apply the exception', ''),
      ['life-plan-simulator'],
    );

    assert.deepStrictEqual(
      issueThemes('perf(ts-data-forge, ts-std-forge): drop it', ''),
      ['ts-data-forge', 'ts-std-forge'],
    );
  });

  test('reads a bracketed scope', () => {
    assert.deepStrictEqual(
      issueThemes('[event-schedule-app] Tie the dialogs', ''),
      ['event-schedule-app'],
    );
  });

  test('takes no theme from a bare conventional type, but ci', () => {
    assert.deepStrictEqual(issueThemes('fix: a thing', ''), []);

    assert.deepStrictEqual(issueThemes('feat!: a thing', ''), []);

    assert.deepStrictEqual(issueThemes('ci: shorten the checks', ''), ['ci']);

    assert.deepStrictEqual(
      issueThemes('ci(node-support-update): a dispatch', ''),
      ['ci', 'node-support-update'],
    );
  });

  test('reads the tooling scopes as one theme', () => {
    assert.deepStrictEqual(issueThemes('fix(tools): close a gap', ''), [
      'tooling',
    ]);

    assert.deepStrictEqual(issueThemes('tools/scripts: one parser', ''), [
      'tooling',
    ]);

    assert.deepStrictEqual(
      issueThemes('check:published-deps: lint the configs', ''),
      ['tooling'],
    );
  });

  test('drops a trailing slash from a scope', () => {
    assert.deepStrictEqual(issueThemes('experimental/: a guard', ''), [
      'experimental',
    ]);
  });

  test('takes no theme from a title with no scope', () => {
    assert.deepStrictEqual(
      issueThemes('Move the checks onto the shared reader', ''),
      [],
    );

    assert.deepStrictEqual(issueThemes('A sentence: with a colon', ''), []);
  });

  test('adds the packages the body names by path', () => {
    assert.deepStrictEqual(
      issueThemes(
        'unblock-prs: keep a set-aside',
        [
          'See [`rebase.mts`](https://github.com/o/r/blob/abc/libs/pr-merge-queue/src/unblock-prs/rebase.mts)',
          'and `apps/pr-manager/src/x.mts`, and `languages/sumi/checker/`.',
        ].join('\n'),
      ),
      ['pr-manager', 'pr-merge-queue', 'sumi', 'unblock-prs'],
    );
  });

  test('takes strict-lib and repo-settings from a path', () => {
    assert.deepStrictEqual(
      issueThemes('A change', 'In `strict-lib/v7.0/` and `repo-settings/`.'),
      ['repo-settings', 'strict-lib'],
    );
  });

  test('does not read a file directly under libs/ as a package', () => {
    assert.deepStrictEqual(
      issueThemes('A change', 'As `libs/first-release.md` says.'),
      [],
    );
  });

  test('does not read a workflow path as the ci theme', () => {
    assert.deepStrictEqual(
      issueThemes('A change', 'It runs in `.github/workflows/release.yml`.'),
      [],
    );
  });

  test('does not read a path inside a longer name', () => {
    assert.deepStrictEqual(
      issueThemes('A change', 'See `node_modules/foo-libs/bar/x`.'),
      [],
    );
  });
});

describe(primaryThemes, () => {
  test('takes the title’s scope alone when it has one', () => {
    assert.deepStrictEqual(
      primaryThemes(
        'eslint-config-typed: a fix',
        'Compare `libs/pr-report-core/` and `apps/synstate-docs/`.',
      ),
      ['eslint-config-typed'],
    );
  });

  test('adds the package a module scope lives in, by the body’s paths', () => {
    assert.deepStrictEqual(
      primaryThemes(
        'unblock-prs: keep a set-aside',
        [
          'In `libs/pr-merge-queue/src/unblock-prs/rebase.mts`,',
          'compared with `libs/pr-report-core/src/labels.mts`.',
        ].join('\n'),
      ),
      ['pr-merge-queue', 'unblock-prs'],
    );

    assert.deepStrictEqual(
      primaryThemes(
        'startable-issues: a fix',
        'See `libs/pr-merge-queue/src/cmd/startable-issues.mts`.',
      ),
      ['pr-merge-queue', 'startable-issues'],
    );
  });

  test('takes the body’s themes when the title has no scope', () => {
    assert.deepStrictEqual(
      primaryThemes(
        'Run the e2e checks on page diffs',
        'In `apps/synstate-docs/`.',
      ),
      ['synstate-docs'],
    );
  });
});

describe(themeMatches, () => {
  test('matches the theme itself and its family', () => {
    assert.isTrue(themeMatches(['synstate'], 'synstate'));

    assert.isTrue(themeMatches(['synstate-dom'], 'synstate'));

    assert.isTrue(themeMatches(['synstate-router-react'], 'Synstate'));
  });

  test('does not match another theme that merely contains it', () => {
    assert.isFalse(themeMatches(['eslint-plugin-synstate'], 'synstate'));

    assert.isFalse(themeMatches(['synstatex'], 'synstate'));

    assert.isFalse(themeMatches([], 'synstate'));
  });
});

const themed = (
  number: number,
  tier: ThemedIssue['tier'],
  themes: readonly string[],
  primary: readonly string[] = themes,
): ThemedIssue => ({ number, tier, themes, primary }) as const;

const numbers = (issues: readonly ThemedIssue[]): readonly number[] =>
  issues.map(({ number }) => number);

describe(orderByTheme, () => {
  describe('with the theme chosen automatically', () => {
    test('takes every S first, then the seed’s theme whatever the tier', () => {
      const order = orderByTheme(
        [
          themed(1, 'S', ['ci']),
          themed(2, 'S', ['synstate']),
          themed(3, 'other', ['event-schedule-app']),
          themed(4, 'other', ['pr-merge-queue']),
          themed(5, 'other', ['pr-merge-queue', 'unblock-prs']),
          themed(6, 'other', ['event-schedule-app']),
          themed(7, 'other', ['event-schedule-app']),
        ],
        { held: new Map<string, readonly number[]>(), theme: undefined },
      );

      assert.deepStrictEqual(numbers(order.taken), [1, 2, 3, 6, 7, 4, 5]);

      assert.deepStrictEqual(order.heldBack, []);
    });

    test('groups by the seed’s own themes, not by a chain of them', () => {
      const order = orderByTheme(
        [
          themed(1, 'other', ['a']),
          themed(2, 'other', ['a', 'b']),
          themed(3, 'other', ['b']),
        ],
        { held: new Map<string, readonly number[]>(), theme: undefined },
      );

      assert.deepStrictEqual(numbers(order.taken), [1, 2, 3]);
    });

    test('keeps a D issue out of a theme whose seed is not D', () => {
      const order = orderByTheme(
        [
          themed(1, 'other', ['task-manager']),
          themed(3, 'other', ['other']),
          themed(2, 'D', ['task-manager']),
          themed(4, 'D', ['task-manager']),
        ],
        { held: new Map<string, readonly number[]>(), theme: undefined },
      );

      assert.deepStrictEqual(numbers(order.taken), [1, 3, 2, 4]);
    });

    test('takes an issue with no theme on its own', () => {
      const order = orderByTheme(
        [
          themed(1, 'other', []),
          themed(2, 'other', []),
          themed(3, 'other', []),
        ],
        { held: new Map<string, readonly number[]>(), theme: undefined },
      );

      assert.deepStrictEqual(numbers(order.taken), [1, 2, 3]);
    });

    test('gathers by the seed’s primary themes, not a package it mentions', () => {
      const order = orderByTheme(
        [
          themed(
            1,
            'other',
            ['eslint-config-typed', 'algo-app'],
            ['eslint-config-typed'],
          ),
          themed(2, 'other', ['algo-app']),
          themed(3, 'other', ['eslint-config-typed']),
        ],
        { held: new Map<string, readonly number[]>(), theme: undefined },
      );

      assert.deepStrictEqual(numbers(order.taken), [1, 3, 2]);
    });

    test('is not held back by a package its body only mentions', () => {
      const order = orderByTheme(
        [
          themed(
            1,
            'other',
            ['eslint-config-typed', 'event-schedule-app'],
            ['eslint-config-typed'],
          ),
        ],
        {
          held: new Map<string, readonly number[]>([
            ['event-schedule-app', [90]],
          ]),
          theme: undefined,
        },
      );

      assert.deepStrictEqual(numbers(order.taken), [1]);

      assert.deepStrictEqual(order.heldBack, []);
    });

    test('holds back what touches a theme another session is on', () => {
      const order = orderByTheme(
        [
          themed(1, 'S', ['pr-merge-queue']),
          themed(2, 'other', ['pr-merge-queue', 'unblock-prs']),
          themed(3, 'other', ['synstate']),
          themed(4, 'other', ['synstate', 'unblock-prs']),
        ],
        {
          held: new Map<string, readonly number[]>([['unblock-prs', [90]]]),
          theme: undefined,
        },
      );

      assert.deepStrictEqual(numbers(order.taken), [1, 3]);

      assert.deepStrictEqual(order.heldBack, [
        { number: 2, themes: ['unblock-prs'] },
        { number: 4, themes: ['unblock-prs'] },
      ]);
    });

    test('takes a priority:S whatever another session is on', () => {
      const order = orderByTheme([themed(1, 'S', ['unblock-prs'])], {
        held: new Map<string, readonly number[]>([['unblock-prs', [90]]]),
        theme: undefined,
      });

      assert.deepStrictEqual(numbers(order.taken), [1]);

      assert.deepStrictEqual(order.heldBack, []);
    });
  });

  describe('with a theme named', () => {
    test('takes that theme alone, its own S first', () => {
      const order = orderByTheme(
        [
          themed(1, 'S', ['ci']),
          themed(2, 'S', ['synstate-dom']),
          themed(3, 'other', ['event-schedule-app']),
          themed(4, 'other', ['synstate']),
          themed(5, 'D', ['synstate-router']),
        ],
        { held: new Map<string, readonly number[]>(), theme: 'synstate' },
      );

      assert.deepStrictEqual(numbers(order.taken), [2, 4, 5]);

      assert.deepStrictEqual(order.heldBack, []);
    });

    test('does not hold it back, since the person chose it', () => {
      const order = orderByTheme([themed(1, 'other', ['synstate'])], {
        held: new Map<string, readonly number[]>([['synstate', [90]]]),
        theme: 'synstate',
      });

      assert.deepStrictEqual(numbers(order.taken), [1]);

      assert.deepStrictEqual(order.heldBack, []);
    });
  });
});
