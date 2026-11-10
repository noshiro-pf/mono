import dedent from 'dedent';
import { Result } from 'ts-data-forge';
import {
  collectMatrixContexts,
  findIdlePatterns,
  readAutoFixPatterns,
  splitAlternatives,
} from './main.mjs';

describe('collectMatrixContexts', () => {
  test('names each entry by the job name with the command put in', () => {
    const read = collectMatrixContexts(dedent`
      name: Code Check

      jobs:
        gates:
          uses: ./.github/workflows/check-gates.yml

        code-check:
          needs: gates
          # The command alone, as the check is named.
          name: code-check (\${{ matrix.command }})
          runs-on: ubuntu-latest

          strategy:
            fail-fast: false
            matrix:
              include:
                # A comment between the entries.
                - command: ws:fix:lint:apps
                  build: ws:build:deps
                - command: 'fix:codemod:affected'
                  diff-base: true

                - command: check:root # The root guards.

          steps:
            - name: Run "\${{ matrix.command }}"
              run: pnpm run \${{ matrix.command }}

        code-check-result:
          needs: code-check
          runs-on: ubuntu-latest
    `);

    assert.deepStrictEqual(read.unreadable, []);

    assert.deepStrictEqual(read.contexts, [
      'code-check (ws:fix:lint:apps)',
      'code-check (fix:codemod:affected)',
      'code-check (check:root)',
    ]);
  });

  test('puts in the property the name reads when the job runs two', () => {
    const read = collectMatrixContexts(dedent`
      jobs:
        code-check:
          name: code-check (\${{ matrix.command }})
          strategy:
            matrix:
              include:
                - command: check:root
                  build: ws:build:deps
          steps:
            - name: Build what "\${{ matrix.command }}" reads
              run: pnpm run \${{ matrix.build }}
            - run: pnpm run \${{ matrix.command }}
    `);

    assert.deepStrictEqual(read.unreadable, []);

    assert.deepStrictEqual(read.contexts, ['code-check (check:root)']);
  });

  test('reads the command handed to `z:ci-job` as `--command`', () => {
    const read = collectMatrixContexts(dedent`
      jobs:
        style-check:
          name: style-check (\${{ matrix.command }})
          strategy:
            matrix:
              include:
                - command: z:ci:style-check:format-and-doc
                  build: ws:build
          steps:
            - run: pnpm run z:ci-job --build \${{ matrix.build }} --command \${{ matrix.command }}
    `);

    assert.deepStrictEqual(read.unreadable, []);

    assert.deepStrictEqual(read.contexts, [
      'style-check (z:ci:style-check:format-and-doc)',
    ]);
  });

  test('names an entry of an unnamed job `<job> (<command>)`', () => {
    const read = collectMatrixContexts(dedent`
      jobs:
        style-check:
          runs-on: ubuntu-latest
          strategy:
            matrix:
              # Two entries.
              command:
                - z:ci:style-check:checks-and-generators
                - "z:ci:style-check:format-and-doc"

          steps:
            - run: pnpm run \${{ matrix.command }}
    `);

    assert.deepStrictEqual(read.unreadable, []);

    assert.deepStrictEqual(read.contexts, [
      'style-check (z:ci:style-check:checks-and-generators)',
      'style-check (z:ci:style-check:format-and-doc)',
    ]);
  });

  test('names a named job with no matrix property `<name> (<entry>)`', () => {
    const read = collectMatrixContexts(dedent`
      jobs:
        lint: # The linters.
          name: "Lint #1"
          strategy:
            matrix:
              command:
                - fix:lint
          steps:
            - run: pnpm run \${{ matrix.command }}
    `);

    assert.deepStrictEqual(read.unreadable, []);

    assert.deepStrictEqual(read.contexts, ['Lint #1 (fix:lint)']);
  });

  test('reads the escapes of a quoted name', () => {
    const read = collectMatrixContexts(dedent`
      jobs:
        single:
          name: 'it''s (\${{ matrix.command }})' # A comment.
          strategy:
            matrix:
              command:
                - fix:a
          steps:
            - run: pnpm run \${{ matrix.command }}
        double:
          name: "say \"hi\" (\${{ matrix.command }})"
          strategy:
            matrix:
              command:
                - fix:b
          steps:
            - run: pnpm run \${{ matrix.command }}
    `);

    assert.deepStrictEqual(read.unreadable, []);

    assert.deepStrictEqual(read.contexts, ["it's (fix:a)", 'say "hi" (fix:b)']);
  });

  test('reads an include entry with a nested list as one entry', () => {
    const read = collectMatrixContexts(dedent`
      jobs:
        code-check:
          name: code-check (\${{ matrix.command }})
          strategy:
            matrix:
              include:
                - command: fix:a
                  args:
                    - command: not-an-entry
          steps:
            - run: pnpm run \${{ matrix.command }}
    `);

    assert.deepStrictEqual(read.unreadable, []);

    assert.deepStrictEqual(read.contexts, ['code-check (fix:a)']);
  });

  test('reads the command of an entry, not of a mapping nested in it', () => {
    const read = collectMatrixContexts(dedent`
      jobs:
        code-check:
          name: code-check (\${{ matrix.command }})
          strategy:
            matrix:
              include:
                - command: fix:a
                  env:
                    command: other
          steps:
            - run: pnpm run \${{ matrix.command }}
    `);

    assert.deepStrictEqual(read.unreadable, []);

    assert.deepStrictEqual(read.contexts, ['code-check (fix:a)']);
  });

  test('reads an include list with no indentation and a flow list', () => {
    const read = collectMatrixContexts(dedent`
      jobs:
        code-check:
          name: code-check (\${{ matrix.command }})
          strategy:
            matrix:
              include:
              - command: fix:a
          steps:
            - run: pnpm run \${{ matrix.command }}
        style-check:
          strategy:
            matrix:
              command: [fix:b, 'fix:c']
          steps:
            - run: pnpm run \${{ matrix.command }}
    `);

    assert.deepStrictEqual(read.unreadable, []);

    assert.deepStrictEqual(read.contexts, [
      'code-check (fix:a)',
      'style-check (fix:b)',
      'style-check (fix:c)',
    ]);
  });

  test('says which property to name an unnamed job that runs two by', () => {
    const read = collectMatrixContexts(dedent`
      jobs:
        code-check:
          strategy:
            matrix:
              include:
                - command: check:root
                  build: ws:build:deps
          steps:
            - run: pnpm run \${{ matrix.build }}
            - run: pnpm run \${{ matrix.command }}
    `);

    assert.deepStrictEqual(read.contexts, []);

    expect(read.unreadable).toHaveLength(1);

    expect(read.unreadable[0]).toContain('`matrix.build`, `matrix.command`');

    expect(read.unreadable[0]).toContain('the one a fixer reruns');
  });

  test('names the checks a job it leaves out may produce', () => {
    const read = collectMatrixContexts(dedent`
      jobs:
        code-check:
          strategy:
            matrix:
              include:
                - command: fix:gen
                  build: ws:build
              os:
                - ubuntu
          steps:
            - run: pnpm run \${{ matrix.command }}
        named:
          name: named (\${{ matrix.command }}, \${{ matrix.os }})
          strategy:
            matrix:
              command:
                - fix:a
          steps:
            - run: pnpm run \${{ matrix.command }}
    `);

    assert.deepStrictEqual(read.contexts, []);

    expect(read.unreadable).toHaveLength(2);

    expect(read.possible).toContain('code-check (fix:gen)');

    expect(read.possible).toContain('code-check (fix:gen, ws:build)');

    expect(read.possible).toContain('named (fix:a, )');

    assert.deepStrictEqual(read.unguessable, []);
  });

  test('names the product of the listed keys of a job it leaves out', () => {
    const read = collectMatrixContexts(dedent`
      jobs:
        code-check:
          strategy:
            matrix:
              command:
                - fix:gen
              os:
                - ubuntu
                - macos
          steps:
            - run: pnpm run \${{ matrix.command }}
    `);

    expect(read.unreadable).toHaveLength(1);

    expect(read.possible).toContain('code-check (fix:gen, ubuntu)');

    expect(read.possible).toContain('code-check (fix:gen, macos)');
  });

  test('names a job it leaves out with no matrix by its name alone', () => {
    const read = collectMatrixContexts(dedent`
      jobs:
        code-check:
          name: Code check
          steps:
            - run: pnpm run \${{ matrix.command }}
    `);

    expect(read.unreadable).toHaveLength(1);

    assert.deepStrictEqual(read.possible, ['Code check']);
  });

  test('says when it cannot guess the checks of a job it leaves out', () => {
    const read = collectMatrixContexts(dedent`
      jobs:
        c:
          name: \${{ format('c ({0})', matrix.command) }}
          strategy:
            matrix:
              command:
                - fix:a
          steps:
            - run: pnpm run \${{ matrix.command }}
        d:
          strategy:
            matrix: \${{ fromJSON(needs.plan.outputs.matrix) }}
          steps:
            - run: pnpm run \${{ matrix.command }}
    `);

    expect(read.unreadable).toHaveLength(2);

    expect(read.unguessable).toHaveLength(2);

    expect(read.unguessable[0]).toContain('`c`');

    expect(read.unguessable[1]).toContain('`d`');
  });

  test('leaves out a job whose name is an expression with a brace in it', () => {
    const read = collectMatrixContexts(dedent`
      jobs:
        c:
          name: \${{ format('c ({0})', matrix.command) }}
          strategy:
            matrix:
              command:
                - fix:a
          steps:
            - run: pnpm run \${{ matrix.command }}
    `);

    assert.deepStrictEqual(read.contexts, []);

    expect(read.unreadable).toHaveLength(1);
  });

  test('leaves out a matrix job that runs no property through pnpm run', () => {
    const read = collectMatrixContexts(dedent`
      jobs:
        test-node-versions:
          strategy:
            matrix:
              node-version:
                - 22
                - 24
          steps:
            # - run: pnpm run \${{ matrix.node-version }}
            - run: pnpm run ws:check:test
        plain:
          steps:
            - run: pnpm run check:root
    `);

    assert.deepStrictEqual(read.contexts, []);

    expect(read.unreadable).toHaveLength(1);

    expect(read.unreadable[0]).toContain('test-node-versions');
  });

  test('does not read a command in a comment of a script', () => {
    const read = collectMatrixContexts(dedent`
      jobs:
        plain:
          strategy:
            matrix:
              command:
                - fix:a
          steps:
            - run: |
                # pnpm run \${{ matrix.command }}
                pnpm run ws:check:test
    `);

    assert.deepStrictEqual(read.contexts, []);

    expect(read.unreadable).toHaveLength(1);
  });

  test('leaves out a job whose matrix has exclude', () => {
    const read = collectMatrixContexts(dedent`
      jobs:
        style-check:
          name: style-check (\${{ matrix.command }})
          strategy:
            matrix:
              command:
                - fix:a
                - fix:b
              exclude:
                - command: fix:b
          steps:
            - run: pnpm run \${{ matrix.command }}
    `);

    assert.deepStrictEqual(read.contexts, []);

    expect(read.unreadable).toHaveLength(1);

    expect(read.unreadable[0]).toContain('exclude');
  });

  test('leaves out an unnamed job whose entries carry other properties', () => {
    // GitHub names such a job by every value of the entry, so the context is
    // not `<job> (<command>)`, and guessing the order would be guessing.
    const read = collectMatrixContexts(dedent`
      jobs:
        code-check:
          strategy:
            matrix:
              include:
                - command: check:root
                  build: ws:build:deps
          steps:
            - run: pnpm run \${{ matrix.command }}
    `);

    assert.deepStrictEqual(read.contexts, []);

    expect(read.unreadable).toHaveLength(1);

    expect(read.unreadable[0]).toContain('code-check');
  });

  test('leaves out a job whose matrix entries cannot be read', () => {
    const read = collectMatrixContexts(dedent`
      jobs:
        code-check:
          strategy:
            matrix:
              command: \${{ fromJSON(needs.plan.outputs.commands) }}
          steps:
            - run: pnpm run \${{ matrix.command }}
    `);

    assert.deepStrictEqual(read.contexts, []);

    expect(read.unreadable).toHaveLength(1);

    expect(read.unreadable[0]).toContain('code-check');
  });

  test('leaves out a job whose name reads another matrix property', () => {
    const read = collectMatrixContexts(dedent`
      jobs:
        code-check:
          name: code-check (\${{ matrix.command }}, \${{ matrix.build }})
          strategy:
            matrix:
              include:
                - command: check:root
                  build: ws:build:deps
          steps:
            - run: pnpm run \${{ matrix.command }}
    `);

    assert.deepStrictEqual(read.contexts, []);

    expect(read.unreadable).toHaveLength(1);

    expect(read.unreadable[0]).toContain('matrix.build');
  });
});

describe('readAutoFixPatterns', () => {
  test('reads every prepare and fixer context, with where it is', () => {
    const config = readAutoFixPatterns(
      autoFixOf({
        ignore: [String.raw`^[\w-]+-result / result$`],
        prepare: [
          { context: String.raw`^code-check \(`, run: 'pnpm run ws:build' },
        ],
        fixers: [
          { context: '^a$|^b$', run: 'pnpm run a', stage: 0 },
          { context: '^b$', run: 'pnpm run b', stage: 1 },
        ],
      }),
    );

    assert.isTrue(Result.isOk(config));

    expect(config.value.autoFix.ignore).toHaveLength(1);

    assert.deepStrictEqual(
      config.value.patterns.map(({ where, kind, source, alternatives }) => ({
        where,
        kind,
        source,
        alternatives: alternatives.map((alternative) => alternative.source),
      })),
      [
        {
          where: 'autoFix.prepare[0].context',
          kind: 'prepare',
          source: String.raw`^code-check \(`,
          alternatives: [String.raw`^code-check \(`],
        },
        {
          where: 'autoFix.fixers[0].context',
          kind: 'fixer',
          source: '^a$|^b$',
          alternatives: ['^a$', '^b$'],
        },
        {
          where: 'autoFix.fixers[1].context',
          kind: 'fixer',
          source: '^b$',
          alternatives: ['^b$'],
        },
      ],
    );
  });

  test('keeps a source as written, which a RegExp would escape', () => {
    const config = readAutoFixPatterns(
      autoFixOf({
        fixers: [{ context: '^a / b$', run: 'pnpm run a', stage: 0 }],
      }),
    );

    assert.isTrue(Result.isOk(config));

    assert.strictEqual(config.value.patterns[0]?.source, '^a / b$');
  });

  test('reads a file with no autoFix as no patterns', () => {
    const config = readAutoFixPatterns({ generatedBranches: [] });

    assert.isTrue(Result.isOk(config));

    assert.deepStrictEqual(config.value.patterns, []);
  });

  test('refuses what unblock-prs refuses: an autoFix without its arrays', () => {
    const config = readAutoFixPatterns({ autoFix: { fixers: [] } });

    assert.isTrue(Result.isErr(config));
  });

  test('reads an alternative with the group numbers of the whole', () => {
    const config = readAutoFixPatterns(
      autoFixOf({
        ignore: [String.raw`^(?<j>a)-result$|^\k<j>-gate$`],
        fixers: [
          { context: String.raw`^(x)y$|^(b)(c)-\2$`, run: '', stage: 0 },
        ],
      }),
    );

    assert.isTrue(Result.isOk(config));

    const [alternatives] = config.value.patterns.map(
      (pattern) => pattern.alternatives,
    );

    assert.deepStrictEqual(
      alternatives?.map(({ source }) => source),
      ['^(x)y$', String.raw`^(b)(c)-\2$`],
    );

    // `\2` is `(b)` in the whole pattern, not `(c)` as it would be alone.
    assert.deepStrictEqual(
      alternatives?.map(({ regex }) => regex.test('bc-b')),
      [false, true],
    );
  });

  test('refuses a context that is not a regular expression', () => {
    const config = readAutoFixPatterns(
      autoFixOf({ fixers: [{ context: '(', run: '', stage: 0 }] }),
    );

    assert.isTrue(Result.isErr(config));

    expect(config.value).toContain('autoFix.fixers[0].context');
  });

  test('refuses an entry whose context is missing', () => {
    const config = readAutoFixPatterns(
      autoFixOf({
        fixers: [
          { context: '^a$', run: '', stage: 0 },
          { run: '', stage: 0 },
        ],
      }),
    );

    assert.isTrue(Result.isErr(config));
  });
});

describe('splitAlternatives', () => {
  test('splits at a top-level bar only', () => {
    assert.deepStrictEqual(
      splitAlternatives(String.raw`^a \(|^(?:b|c) [|]\|$`),
      [String.raw`^a \(`, String.raw`^(?:b|c) [|]\|$`],
    );
  });

  test('keeps a pattern with no top-level bar whole', () => {
    assert.deepStrictEqual(splitAlternatives('^(?:a|b)$'), ['^(?:a|b)$']);
  });
});

/** An `.github/unblock-prs.json` with the arrays `autoFix` needs, filled in. */
const autoFixOf = ({
  ignore = [],
  prepare = [],
  fixers = [],
}: Readonly<{
  ignore?: readonly string[];
  prepare?: readonly unknown[];
  fixers?: readonly unknown[];
}>): unknown =>
  ({ autoFix: { ignore, before: [], prepare, fixers, after: [] } }) as const;

const configOf = (
  file: Parameters<typeof autoFixOf>[0],
): ReturnType<typeof readAutoFixPatterns> extends Result<infer C, unknown>
  ? C
  : never => {
  const config = readAutoFixPatterns(autoFixOf(file));

  assert.isTrue(Result.isOk(config));

  return config.value;
};

describe('findIdlePatterns', () => {
  const contexts = [
    'code-check (ws:fix:lint:apps)',
    'code-check (check:root)',
    'style-check (z:ci:style-check:checks-and-generators)',
    'code-check-result / result',
  ] as const;

  test('passes when every pattern takes a context', () => {
    const config = configOf({
      prepare: [
        { context: String.raw`^code-check \(`, run: 'pnpm run ws:build' },
      ],
      fixers: [
        {
          context: String.raw`^code-check \((ws:fix:[^)]*)\)$`,
          run: 'pnpm run $1',
          stage: 1,
        },
      ],
    });

    assert.deepStrictEqual(findIdlePatterns(config, contexts, []), []);
  });

  test('names a fixer whose entry was renamed or bundled away', () => {
    const config = configOf({
      fixers: [
        {
          context: String.raw`^style-check \((fix:fmt:full)\)$`,
          run: 'pnpm run $1',
          stage: 2,
        },
      ],
    });

    const violations = findIdlePatterns(config, contexts, []);

    expect(violations).toHaveLength(1);

    expect(violations[0]).toContain('autoFix.fixers[0].context');
  });

  test('names an alternative that went stale beside a live one', () => {
    const config = configOf({
      prepare: [
        {
          context: String.raw`^code-check \(|^style-check \(z:ci:style-check:renamed\)$`,
          run: 'pnpm run ws:build',
        },
      ],
      fixers: [{ context: '^(?:code|style)-check ', run: '', stage: 0 }],
    });

    const violations = findIdlePatterns(config, contexts, []);

    expect(violations).toHaveLength(1);

    expect(violations[0]).toContain('autoFix.prepare[0].context');

    expect(violations[0]).toContain('z:ci:style-check:renamed');
  });

  test('names a prepare entry that matches no context', () => {
    const config = configOf({
      prepare: [{ context: String.raw`^lint \(`, run: 'pnpm run ws:build' }],
    });

    const violations = findIdlePatterns(config, contexts, []);

    expect(violations).toHaveLength(1);

    expect(violations[0]).toContain('autoFix.prepare[0].context');
  });

  test('names a prepare entry whose checks no fixer takes', () => {
    // A failure no fixer takes declines the whole fix, prepare included.
    const config = configOf({
      prepare: [
        { context: String.raw`^style-check \(`, run: 'pnpm run ws:build' },
      ],
      fixers: [
        { context: String.raw`^code-check \(`, run: 'pnpm run a', stage: 0 },
      ],
    });

    const violations = findIdlePatterns(config, contexts, []);

    expect(violations).toHaveLength(1);

    expect(violations[0]).toContain('autoFix.prepare[0].context');
  });

  test('names a fixer whose checks the ignore list leaves unread', () => {
    const config = configOf({
      ignore: [String.raw`^[\w-]+-result / result$`],
      fixers: [{ context: '-result / result$', run: 'pnpm run a', stage: 0 }],
    });

    const violations = findIdlePatterns(config, contexts, []);

    expect(violations).toHaveLength(1);

    expect(violations[0]).toContain('autoFix.ignore');
  });

  test('names a fixer that an earlier one leaves nothing to', () => {
    // unblock-prs takes the first fixer a context matches, so the second one
    // never runs, however many contexts it matches.
    const config = configOf({
      fixers: [
        { context: String.raw`^code-check \(`, run: 'pnpm run a', stage: 0 },
        {
          context: String.raw`^code-check \((ws:fix:lint:apps)\)$`,
          run: 'pnpm run $1',
          stage: 1,
        },
      ],
    });

    const violations = findIdlePatterns(config, contexts, []);

    expect(violations).toHaveLength(1);

    expect(violations[0]).toContain('autoFix.fixers[1].context');

    expect(violations[0]).toContain('autoFix.fixers[0].context');
  });

  test('passes a pattern kept idle on purpose', () => {
    const config = configOf({
      fixers: [
        { context: String.raw`^x \((gen)\)$`, run: 'pnpm run $1', stage: 0 },
      ],
    });

    assert.deepStrictEqual(
      findIdlePatterns(config, contexts, [
        {
          kind: 'fixer',
          context: String.raw`^x \((gen)\)$`,
          reason: 'for a future entry',
        },
      ]),
      [],
    );
  });

  test('names a pattern kept idle that now takes a context', () => {
    const config = configOf({
      fixers: [
        { context: String.raw`^code-check \(`, run: 'pnpm run $1', stage: 0 },
      ],
    });

    const violations = findIdlePatterns(config, contexts, [
      {
        kind: 'fixer',
        context: String.raw`^code-check \(`,
        reason: 'for a future entry',
      },
    ]);

    expect(violations).toHaveLength(1);

    expect(violations[0]).toContain('KEPT_IDLE');
  });

  test('asks a copy of a pattern kept idle', () => {
    const config = configOf({
      fixers: [
        { context: String.raw`^x \((gen)\)$`, run: 'pnpm run $1', stage: 0 },
        { context: String.raw`^x \((gen)\)$`, run: 'pnpm run $1', stage: 1 },
      ],
    });

    const violations = findIdlePatterns(config, contexts, [
      {
        kind: 'fixer',
        context: String.raw`^x \((gen)\)$`,
        reason: 'for a future entry',
      },
    ]);

    expect(violations).toHaveLength(1);

    expect(violations[0]).toContain('autoFix.fixers[1].context');
  });

  test('exempts the entry of the kind KEPT_IDLE names, not the first', () => {
    // A prepare entry and a fixer with one source: KEPT_IDLE names the fixer,
    // so the prepare entry, which comes first, is still asked.
    const config = configOf({
      prepare: [{ context: String.raw`^x \(`, run: 'pnpm run ws:build' }],
      fixers: [{ context: String.raw`^x \(`, run: 'pnpm run a', stage: 0 }],
    });

    const violations = findIdlePatterns(config, contexts, [
      {
        kind: 'fixer',
        context: String.raw`^x \(`,
        reason: 'for a future entry',
      },
    ]);

    expect(violations).toHaveLength(1);

    expect(violations[0]).toContain('autoFix.prepare[0].context');
  });

  test('names a pattern kept idle that a job left out may produce', () => {
    const config = configOf({
      fixers: [
        { context: String.raw`^x \((gen)\)$`, run: 'pnpm run $1', stage: 0 },
      ],
    });

    const violations = findIdlePatterns(
      config,
      contexts,
      [
        {
          kind: 'fixer',
          context: String.raw`^x \((gen)\)$`,
          reason: 'for a future entry',
        },
      ],
      { possible: ['x (gen)'], unguessable: [] },
    );

    expect(violations).toHaveLength(1);

    expect(violations[0]).toContain('KEPT_IDLE');

    expect(violations[0]).toContain('`x (gen)`');
  });

  test('names a pattern kept idle while a job left out cannot be guessed', () => {
    const config = configOf({
      fixers: [
        { context: String.raw`^x \((gen)\)$`, run: 'pnpm run $1', stage: 0 },
      ],
    });

    const violations = findIdlePatterns(
      config,
      contexts,
      [
        {
          kind: 'fixer',
          context: String.raw`^x \((gen)\)$`,
          reason: 'for a future entry',
        },
      ],
      { possible: [], unguessable: ['job `c`'] },
    );

    expect(violations).toHaveLength(1);

    expect(violations[0]).toContain('job `c`');
  });

  test('names a pattern kept idle that the file no longer has', () => {
    const violations = findIdlePatterns(configOf({}), contexts, [
      { kind: 'fixer', context: '^gone$', reason: 'for a future entry' },
    ]);

    expect(violations).toHaveLength(1);

    expect(violations[0]).toContain('^gone$');
  });
});
