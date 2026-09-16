import dedent from 'dedent';
import { type ReadonlyRecord } from 'ts-type-forge';
import {
  buildCoverageGraph,
  collectWorkflowCommands,
  findRedundantCommands,
  findUncoveredCommands,
  matchScriptNames,
  resolveScriptInvocations,
  type CheckWorkflow,
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
