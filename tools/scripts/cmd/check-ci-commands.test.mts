import dedent from 'dedent';
import type { ReadonlyRecord } from 'ts-type-forge';
import {
  buildCoverageGraph,
  collectWorkflowCommands,
  commandsAnyPlanRuns,
  findCommandsMissingLocally,
  findRedundantCommands,
  findUncoveredCommands,
  isWriterScript,
  matchScriptNames,
  resolveScriptInvocations,
  type CheckWorkflow,
  type LocalRunner,
  type Manifest,
} from './check-ci-commands.mjs';

const rootManifest = (scripts: ReadonlyRecord<string, string>): Manifest =>
  ({ directory: '.', scripts }) as const;

const packageManifest = (
  directory: string,
  scripts: ReadonlyRecord<string, string>,
): Manifest => ({ directory, scripts }) as const;

const workflow = (
  relativePath: string,
  commands: readonly string[],
  pinsNodeVersion = false,
): CheckWorkflow => ({ relativePath, commands, pinsNodeVersion }) as const;

describe('resolveScriptInvocations', () => {
  test('reads a local `pnpm run`', () => {
    assert.deepStrictEqual(resolveScriptInvocations('pnpm run check:md'), {
      local: ['check:md'],
      recursive: [],
    });
  });

  test('reads a recursive run as reaching every package', () => {
    assert.deepStrictEqual(
      resolveScriptInvocations(
        'pnpm run --recursive --workspace-concurrency=1 --if-present check:test',
      ),
      { local: [], recursive: ['check:test'] },
    );
  });

  test('reads every name of an npm-run-all list', () => {
    assert.deepStrictEqual(
      resolveScriptInvocations('run-s gen:index gen:readme'),
      {
        local: ['gen:index', 'gen:readme'],
        recursive: [],
      },
    );
  });

  test('reads both sides of a chained body', () => {
    assert.deepStrictEqual(
      resolveScriptInvocations(
        'cspell "**" --no-progress && pnpm run check:cspell:changeset',
      ),
      { local: ['check:cspell:changeset'], recursive: [] },
    );
  });

  test('ignores an invocation that hands the script an argument', () => {
    // `verify:npm-packages:published`. `--published` selects the versions
    // pinned under verify-npm-packages/published, which is not what the bare
    // script checks — so this is a variant, not a run of the same check.
    assert.deepStrictEqual(
      resolveScriptInvocations('pnpm run verify:npm-packages --published'),
      { local: [], recursive: [] },
    );
  });

  test('keeps a recursive run, whose flags precede the script name', () => {
    assert.deepStrictEqual(
      resolveScriptInvocations(
        'pnpm run --recursive --if-present "/^check:dist/"',
      ),
      { local: [], recursive: ['/^check:dist/'] },
    );
  });

  test('reads nothing out of a body that runs no script', () => {
    assert.deepStrictEqual(
      resolveScriptInvocations('tsc -p ./tsconfig.json --noEmit'),
      { local: [], recursive: [] },
    );
  });
});

describe('matchScriptNames', () => {
  const names = [
    'check:md',
    'check:prose',
    'check:prose:one',
    'check:prose:two',
  ] as const;

  test('takes a literal name', () => {
    assert.deepStrictEqual(matchScriptNames('check:md', names), ['check:md']);
  });

  test('takes a name that no script defines as nothing', () => {
    assert.deepStrictEqual(matchScriptNames('check:absent', names), []);
  });

  test('expands the regular expression pnpm reads between slashes', () => {
    assert.deepStrictEqual(matchScriptNames('/check:prose:.*/', names), [
      'check:prose:one',
      'check:prose:two',
    ]);
  });

  test('expands an npm-run-all glob', () => {
    assert.deepStrictEqual(matchScriptNames('check:prose:*', names), [
      'check:prose:one',
      'check:prose:two',
    ]);
  });
});

describe('collectWorkflowCommands', () => {
  test('reads the entries of a matrix the workflow hands to `pnpm run`', () => {
    const text = dedent`
      jobs:
        style-check:
          strategy:
            matrix:
              command:
                # A comment, and a blank line, are not entries.

                - check:md
                - check:prose
          steps:
            - name: Run "\${{ matrix.command }}"
              run: pnpm run \${{ matrix.command }}
    `;

    assert.deepStrictEqual(collectWorkflowCommands(text), [
      'check:md',
      'check:prose',
    ]);
  });

  test('reads a step that names the script itself', () => {
    const text = dedent`
      jobs:
        build:
          steps:
            - name: Build all packages
              run: pnpm run ws:build
    `;

    assert.deepStrictEqual(collectWorkflowCommands(text), ['ws:build']);
  });

  test('reads no matrix whose entries reach no `pnpm run`', () => {
    const text = dedent`
      jobs:
        test-node-versions:
          strategy:
            matrix:
              target: [minimum, lts]
          steps:
            - run: pnpm run ws:check:test
    `;

    assert.deepStrictEqual(collectWorkflowCommands(text), ['ws:check:test']);
  });
});

describe('buildCoverageGraph', () => {
  test('connects a root `ws:` command to that script in every package', () => {
    const manifests = [
      rootManifest({
        'ws:check:types': 'pnpm run --recursive --if-present check:types',
      }),
      packageManifest('libs/a', { 'check:types': 'tsc --noEmit' }),
      packageManifest('libs/b', { 'check:types': 'tsc --noEmit' }),
    ] as const;

    const graph = buildCoverageGraph(manifests);

    assert.deepStrictEqual(
      Array.from(graph.edges.get('.:ws:check:types') ?? []).toSorted(),
      ['libs/a:check:types', 'libs/b:check:types'],
    );
  });

  test('applies a declared relation to every manifest defining both names', () => {
    const manifests = [
      packageManifest('libs/a', {
        'check:lint': 'eslint .',
        'fix:lint': 'eslint . --fix',
      }),
      packageManifest('libs/b', { 'check:lint': 'eslint .' }),
    ] as const;

    const graph = buildCoverageGraph(manifests);

    assert.deepStrictEqual(
      Array.from(graph.edges.get('libs/a:fix:lint') ?? []),
      ['libs/a:check:lint'],
    );

    assert.deepStrictEqual(graph.edges.get('libs/b:fix:lint'), undefined);
  });
});

describe('findRedundantCommands', () => {
  const manifests = [
    rootManifest({
      'check:prose': "pnpm run '/check:prose:.*/'",
      'check:prose:one': 'tsx ./one.mts',
      'ws:check:test': 'pnpm run --recursive --if-present check:test',
      'ws:check:test:cov': 'run-s ws:check:test:cov:run',
      'ws:check:test:cov:run':
        'pnpm run --recursive --if-present check:test:cov',
    }),
  ] as const;

  test('reports a command another command in the same group already runs', () => {
    const violations = findRedundantCommands(
      [
        workflow('.github/workflows/style-check.yml', [
          'check:prose',
          'check:prose:one',
        ]),
      ],
      buildCoverageGraph(manifests),
    );

    assert.deepStrictEqual(violations.length, 1);

    assert.isTrue(
      (violations[0] ?? '').includes(
        '`check:prose` already runs `check:prose:one`',
      ),
    );
  });

  test('reports a pair that two different workflows contribute', () => {
    const violations = findRedundantCommands(
      [
        workflow('.github/workflows/a.yml', ['check:prose']),
        workflow('.github/workflows/b.yml', ['check:prose:one']),
      ],
      buildCoverageGraph(manifests),
    );

    assert.deepStrictEqual(violations.length, 1);
  });

  test('leaves a workflow that pins its own Node out of the comparison', () => {
    // `node-version-compatibility.yml`: its `ws:check:test` is covered by
    // `ws:check:test:cov` on paper and is not the same check, because the Node
    // underneath differs. Which versions it may name is check-node-support's.
    const violations = findRedundantCommands(
      [
        workflow('.github/workflows/code-check.yml', ['ws:check:test:cov']),
        workflow(
          '.github/workflows/node-version-compatibility.yml',
          ['ws:check:test'],
          true,
        ),
      ],
      buildCoverageGraph(manifests),
    );

    assert.deepStrictEqual(violations, []);
  });

  test('says nothing about a command run once', () => {
    assert.deepStrictEqual(
      findRedundantCommands(
        [workflow('.github/workflows/style-check.yml', ['check:prose'])],
        buildCoverageGraph(manifests),
      ),
      [],
    );
  });
});

describe('findUncoveredCommands', () => {
  const manifests = [
    rootManifest({
      'check:prose': "pnpm run '/check:prose:.*/'",
      'check:prose:one': 'tsx ./one.mts',
      'ws:check:types': 'pnpm run --recursive --if-present check:types',
      'z:check-should-run': 'tsx ./gate.mts',
      'fix:fmt': 'prettier --write .',
    }),
    packageManifest('libs/a', {
      'check:types': 'tsc --noEmit',
      'check:invariants': 'tsx ./invariants.mts',
    }),
  ] as const;

  const graph = buildCoverageGraph(manifests);

  test('says nothing about a check some workflow reaches, however indirectly', () => {
    const violations = findUncoveredCommands(
      [workflow('.github/workflows/a.yml', ['check:prose', 'ws:check:types'])],
      manifests,
      graph,
    );

    assert.deepStrictEqual(violations, [
      '`check:invariants` in libs/a/package.json is a check that no check workflow runs.',
    ]);
  });

  test('reports a root check no workflow runs', () => {
    const violations = findUncoveredCommands(
      [workflow('.github/workflows/a.yml', ['ws:check:types'])],
      manifests,
      graph,
    );

    assert.isTrue(
      violations.includes(
        '`check:prose` in ./package.json is a check that no check workflow runs.',
      ),
    );

    assert.isTrue(
      violations.includes(
        '`check:prose:one` in ./package.json is a check that no check workflow runs.',
      ),
    );
  });

  test('asks nothing of the `z:` plumbing or of a writer', () => {
    const violations = findUncoveredCommands([], manifests, graph);

    assert.isFalse(
      violations.some((message) => message.includes('z:check-should-run')),
    );

    assert.isFalse(violations.some((message) => message.includes('fix:fmt')));
  });
});

describe('findCommandsMissingLocally', () => {
  const manifests = [
    rootManifest({
      'ws:build': 'tsx ./build.mts',
      'ws:check:types': 'pnpm run --recursive --if-present check:types',
      'ws:check:types:half':
        "pnpm run --recursive --if-present --filter='./libs/**' check:types",
      'ws:check:dist': 'pnpm run --recursive --if-present check:dist',
      'ws:gen': 'pnpm run --recursive --if-present gen',
      'check:md': 'markdownlint-cli2',
      'gen:graph': 'tsx ./graph.mts',
      'z:assert-repo-is-clean': 'tsx ./clean.mts',
      'z:ci:aggregate': 'run-s --continue-on-error check:md gen:graph ws:gen',
      'fix:fmt:full': 'prettier --write .',
      'fix:fmt:diff': 'pnpm run z:format-diff',
      'z:format-diff': 'tsx ./format-diff.mts',
      'fix:fmt': 'pnpm run z:format-uncommitted',
      'z:format-uncommitted': 'tsx ./format-uncommitted.mts',
      'fix:codemod:diff':
        'pnpm run z:ts-codemod --diff-from origin/main && pnpm run fix:fmt',
      'ws:check:types:half-again':
        "pnpm run --recursive --if-present --filter='./libs/**' check:types",
    }),
    packageManifest('libs/a', {
      'check:types': 'tsc --noEmit',
      'check:dist': 'tsx ./dist.mts',
      gen: 'tsx ./gen.mts',
    }),
    packageManifest('libs/b', {
      'check:types': 'tsc --noEmit',
      gen: 'tsx ./gen.mts',
    }),
  ] as const;

  const graph = buildCoverageGraph(manifests);

  const runner = (
    runs: readonly string[],
    leftOut: readonly string[] = [],
    asks: (scriptName: string) => boolean = () => true,
  ): LocalRunner =>
    ({
      name: 'check-all.mts',
      remedy: 'add a step that reaches it, or list it in LEFT_TO_CI.',
      runs,
      leftOut,
      asks,
    }) as const;

  test('reports a command CI runs and no step reaches', () => {
    const violations = findCommandsMissingLocally({
      workflows: [
        workflow('.github/workflows/a.yml', ['ws:build', 'check:md']),
      ],
      graph,
      runner: runner(['.:ws:build']),
    });

    assert.deepStrictEqual(violations, [
      '`check:md` (.github/workflows/a.yml) is run by CI and not by check-all.mts: add a step that reaches it, or list it in LEFT_TO_CI.',
    ]);
  });

  test('takes a command whose every target a step reaches as run', () => {
    // `ws:check:types:non-strict-lib` against `ws:check:types`: the half is
    // never named, and every package script it runs is.
    const violations = findCommandsMissingLocally({
      workflows: [workflow('.github/workflows/a.yml', ['ws:check:types:half'])],
      graph,
      runner: runner(['.:ws:check:types']),
    });

    assert.deepStrictEqual(violations, []);
  });

  test('names the one entry of an aggregate that no step reaches', () => {
    const violations = findCommandsMissingLocally({
      workflows: [workflow('.github/workflows/a.yml', ['z:ci:aggregate'])],
      graph,
      runner: runner(['.:check:md', '.:ws:gen']),
    });

    assert.deepStrictEqual(violations, [
      '`gen:graph` (.github/workflows/a.yml) is run by CI and not by check-all.mts: add a step that reaches it, or list it in LEFT_TO_CI.',
    ]);
  });

  test('names a recursive command whole when no script it reaches is run', () => {
    const violations = findCommandsMissingLocally({
      workflows: [workflow('.github/workflows/a.yml', ['z:ci:aggregate'])],
      graph,
      runner: runner(['.:check:md', '.:gen:graph']),
    });

    assert.deepStrictEqual(violations, [
      '`ws:gen` (.github/workflows/a.yml) is run by CI and not by check-all.mts: add a step that reaches it, or list it in LEFT_TO_CI.',
    ]);
  });

  test('names each workflow that runs a missing command', () => {
    const violations = findCommandsMissingLocally({
      workflows: [
        workflow('.github/workflows/a.yml', ['gen:graph']),
        workflow('.github/workflows/b.yml', ['gen:graph'], true),
      ],
      graph,
      runner: runner([]),
    });

    assert.deepStrictEqual(violations, [
      '`gen:graph` (.github/workflows/a.yml, .github/workflows/b.yml) is run by CI and not by check-all.mts: add a step that reaches it, or list it in LEFT_TO_CI.',
    ]);
  });

  test('accepts a command left to CI, at any depth', () => {
    const violations = findCommandsMissingLocally({
      workflows: [
        workflow('.github/workflows/a.yml', [
          'z:ci:aggregate',
          'z:assert-repo-is-clean',
        ]),
      ],
      graph,
      runner: runner(
        ['.:check:md', '.:ws:gen'],
        ['gen:graph', 'z:assert-repo-is-clean'],
      ),
    });

    assert.deepStrictEqual(violations, []);
  });

  test('reports a command left to CI that no check workflow runs', () => {
    const violations = findCommandsMissingLocally({
      workflows: [workflow('.github/workflows/a.yml', ['ws:build'])],
      graph,
      runner: runner(['.:ws:build'], ['ws:check:dist']),
    });

    assert.deepStrictEqual(violations, [
      'check-all.mts leaves `ws:check:dist` to CI, and no check workflow runs it; remove it from the list.',
    ]);
  });

  test('reports a command left to CI that a step reaches after all', () => {
    const violations = findCommandsMissingLocally({
      workflows: [workflow('.github/workflows/a.yml', ['check:md'])],
      graph,
      runner: runner(['.:check:md'], ['check:md']),
    });

    assert.deepStrictEqual(violations, [
      'check-all.mts leaves `check:md` to CI, and runs it as well; remove it from the list.',
    ]);
  });

  test('does not take a narrower command, declared as covered, for the CI one', () => {
    // `fix:fmt:full` covers `fix:fmt:diff` by DECLARED_COVERAGE; running the
    // diff alone leaves the rest of the tree unformatted.
    const violations = findCommandsMissingLocally({
      workflows: [workflow('.github/workflows/a.yml', ['fix:fmt:full'])],
      graph,
      runner: runner(['.:fix:fmt:diff']),
    });

    assert.deepStrictEqual(violations, [
      '`fix:fmt:full` (.github/workflows/a.yml) is run by CI and not by check-all.mts: add a step that reaches it, or list it in LEFT_TO_CI.',
    ]);
  });

  test('reports a command left to CI that a workflow reaches only by a declared edge', () => {
    const violations = findCommandsMissingLocally({
      workflows: [workflow('.github/workflows/a.yml', ['fix:fmt:full'])],
      graph,
      runner: runner([], ['fix:fmt:full', 'fix:fmt:diff']),
    });

    assert.deepStrictEqual(violations, [
      'check-all.mts leaves `fix:fmt:diff` to CI, and no check workflow runs it; remove it from the list.',
    ]);
  });

  test('names a writer whose body runs only plumbing nothing runs', () => {
    const violations = findCommandsMissingLocally({
      workflows: [workflow('.github/workflows/a.yml', ['fix:fmt'])],
      graph,
      runner: runner([], [], isWriterScript),
    });

    assert.deepStrictEqual(violations, [
      '`fix:fmt` (.github/workflows/a.yml) is run by CI and not by check-all.mts: add a step that reaches it, or list it in LEFT_TO_CI.',
    ]);
  });

  test('does not take a body that also runs a script with arguments as run by its edges', () => {
    // Its only edge is `fix:fmt`; the codemod it runs first adds none.
    const violations = findCommandsMissingLocally({
      workflows: [workflow('.github/workflows/a.yml', ['fix:codemod:diff'])],
      graph,
      runner: runner(['.:fix:fmt']),
    });

    assert.deepStrictEqual(violations, [
      '`fix:codemod:diff` (.github/workflows/a.yml) is run by CI and not by check-all.mts: add a step that reaches it, or list it in LEFT_TO_CI.',
    ]);
  });

  test('reports a command left to CI that every script under it runs anyway', () => {
    const violations = findCommandsMissingLocally({
      workflows: [
        workflow('.github/workflows/a.yml', ['ws:check:types:half-again']),
      ],
      graph,
      runner: runner(['.:ws:check:types'], ['ws:check:types:half-again']),
    });

    assert.deepStrictEqual(violations, [
      'check-all.mts leaves `ws:check:types:half-again` to CI, and runs it as well; remove it from the list.',
    ]);
  });

  test('asks only about the scripts the runner answers for', () => {
    // check-changed answers for the generators: a check it leaves to CI is
    // in its README, and a generator it misses is a dirty tree in CI.
    const violations = findCommandsMissingLocally({
      workflows: [
        workflow('.github/workflows/a.yml', [
          'ws:check:dist',
          'z:ci:aggregate',
        ]),
      ],
      graph,
      runner: runner(['.:check:md', 'libs/a:gen'], [], isWriterScript),
    });

    assert.deepStrictEqual(violations, [
      '`gen:graph` (.github/workflows/a.yml) is run by CI and not by check-all.mts: add a step that reaches it, or list it in LEFT_TO_CI.',
      '`ws:gen` (.github/workflows/a.yml) is run by CI and not by check-all.mts: add a step that reaches it, or list it in LEFT_TO_CI.',
    ]);
  });
});

describe('isWriterScript', () => {
  test('takes `gen` and `fix` under any scope, and a bare `gen`', () => {
    assert.isTrue(isWriterScript('gen'));

    assert.isTrue(isWriterScript('ws:gen'));

    assert.isTrue(isWriterScript('gen:license-files'));

    assert.isTrue(isWriterScript('strict-lib:fix:fmt'));

    assert.isTrue(isWriterScript('ws:fix:lint:apps'));
  });

  test('leaves the checks, the builds and a name that only contains a verb', () => {
    assert.isFalse(isWriterScript('check:md'));

    assert.isFalse(isWriterScript('ws:build'));

    assert.isFalse(isWriterScript('doc'));

    assert.isFalse(isWriterScript('check:gen-index'));
  });
});

describe('commandsAnyPlanRuns', () => {
  test('reads the root and package scripts a plan touching everything runs', () => {
    const runs = commandsAnyPlanRuns([
      rootManifest({
        'check:root:one': 'tsx ./one.mts',
        'check:root:two': 'tsx ./two.mts',
        'gen:deps-graph': 'tsx ./graph.mts',
        'gen:license-files': 'tsx ./license.mts',
        'strict-lib:fix:fmt': 'oxfmt ./strict-lib',
      }),
      packageManifest('libs/a', {
        gen: 'tsx ./gen.mts',
        'fix:lint': 'eslint . --fix',
      }),
    ]);

    const expected = [
      '.:check:root:one',
      '.:check:root:two',
      '.:gen:deps-graph',
      '.:gen:license-files',
      '.:strict-lib:fix:fmt',
      'libs/a:gen',
      'libs/a:fix:lint',
    ] as const;

    assert.deepStrictEqual(
      expected.filter((command) => !runs.includes(command)),
      [],
    );
  });
});
