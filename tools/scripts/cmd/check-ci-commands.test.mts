import dedent from 'dedent';
import { Arr, Result } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import {
  buildCoverageGraph,
  collectWorkflowCommands,
  findRedundantCommands,
  findUncoveredCommands,
  readMatrixInclude,
  resolvePackageRuns,
  resolveScriptInvocations,
  type CheckWorkflow,
  type Manifest,
  type ScriptInvocations,
} from './check-ci-commands.mjs';

const rootManifest = (scripts: ReadonlyRecord<string, string>): Manifest =>
  ({ directory: '.', scripts }) as const;

const packageManifest = (
  directory: string,
  scripts: ReadonlyRecord<string, string>,
): Manifest =>
  ({
    directory,
    name: directory.slice(directory.lastIndexOf('/') + 1),
    scripts,
  }) as const;

const workflow = (
  relativePath: string,
  commands: readonly string[],
  pinsNodeVersion = false,
): CheckWorkflow =>
  ({
    relativePath,
    commands,
    packageRuns: [],
    problems: [],
    pinsNodeVersion,
  }) as const;

const invocations = (read: Partial<ScriptInvocations>): ScriptInvocations =>
  ({
    local: [],
    recursive: [],
    pointed: [],
    problems: [],
    ...read,
  }) as const;

const commandsOf = (text: string): readonly string[] =>
  collectWorkflowCommands(text).commands;

describe('resolveScriptInvocations', () => {
  test('reads a local `pnpm run`', () => {
    assert.deepStrictEqual(
      resolveScriptInvocations('pnpm run check:md'),
      invocations({ local: ['check:md'], recursive: [] }),
    );
  });

  test('reads a recursive run as reaching every package', () => {
    assert.deepStrictEqual(
      resolveScriptInvocations(
        'pnpm run --recursive --workspace-concurrency=1 --if-present check:test',
      ),
      invocations({
        local: [],
        recursive: [{ pattern: 'check:test', filters: [] }],
      }),
    );
  });

  test('keeps the filters of a recursive run, in both spellings', () => {
    assert.deepStrictEqual(
      resolveScriptInvocations(
        "pnpm run --recursive --filter='!./apps/**' --filter synstate -F=a check:test",
      ),
      invocations({
        local: [],
        recursive: [
          { pattern: 'check:test', filters: ['!./apps/**', 'synstate', 'a'] },
        ],
      }),
    );
  });

  test('reads every name of an npm-run-all list', () => {
    assert.deepStrictEqual(
      resolveScriptInvocations('run-s gen:index gen:readme'),
      invocations({ local: ['gen:index', 'gen:readme'], recursive: [] }),
    );
  });

  test('reads both sides of a chained body', () => {
    assert.deepStrictEqual(
      resolveScriptInvocations(
        'cspell "**" --no-progress && pnpm run check:cspell:changeset',
      ),
      invocations({ local: ['check:cspell:changeset'], recursive: [] }),
    );
  });

  test('ignores an invocation that hands the script an argument', () => {
    // `verify:npm-packages:published`. `--published` selects the versions
    // pinned under verify-npm-packages/published, which is not what the bare
    // script checks — so this is a variant, not a run of the same check.
    assert.deepStrictEqual(
      resolveScriptInvocations('pnpm run verify:npm-packages --published'),
      invocations({ local: [], recursive: [] }),
    );
  });

  test('keeps a recursive run, whose flags precede the script name', () => {
    assert.deepStrictEqual(
      resolveScriptInvocations(
        'pnpm run --recursive --if-present "/^check:dist/"',
      ),
      invocations({
        local: [],
        recursive: [{ pattern: '/^check:dist/', filters: [] }],
      }),
    );
  });

  test('a run with arguments of its own is a variant, in a list as after `pnpm run`', () => {
    assert.deepStrictEqual(
      resolveScriptInvocations('run-s check:md "gen:x -- --all"'),
      invocations({ local: ['check:md'] }),
    );
  });

  test('the value of a flag that takes one is no script', () => {
    assert.deepStrictEqual(
      resolveScriptInvocations(
        'pnpm run -r --workspace-concurrency 1 check:test && run-p --max-parallel 2 a b',
      ),
      invocations({
        local: ['a', 'b'],
        recursive: [{ pattern: 'check:test', filters: [] }],
      }),
    );
  });

  test('reads a run pointed at packages with flags before `run`', () => {
    assert.deepStrictEqual(
      resolveScriptInvocations(
        'pnpm --dir ../functions run build && pnpm --filter synstate run build',
      ),
      invocations({
        recursive: [{ pattern: 'build', filters: ['synstate'] }],
        pointed: [{ pattern: 'build', directory: '../functions' }],
      }),
    );
  });

  test('a trailing comment and a quoted `pnpm run` are not runs', () => {
    assert.deepStrictEqual(
      resolveScriptInvocations(
        'echo "then pnpm run quoted" # then pnpm run commented',
      ),
      invocations({}),
    );
  });

  test('reports what the shell reader cannot read', () => {
    assert.isNotEmpty(resolveScriptInvocations("echo 'open").problems);
  });

  test('reads nothing out of a body that runs no script', () => {
    assert.deepStrictEqual(
      resolveScriptInvocations('tsc -p ./tsconfig.json --noEmit'),
      invocations({ local: [], recursive: [] }),
    );
  });
});

describe('readMatrixInclude', () => {
  test('reads each `include` entry with its properties', () => {
    const text = dedent`
      jobs:
        code-check:
          strategy:
            matrix:
              include:
                # A comment is not a property.
                - command: ws:fix:lint:apps
                  build: ws:build:deps

                - command: ws:check:e2e:shard-2
                  build: ws:build
                  browser: true

                - command: 'ws:check:test:browser' # a quoted value
                  build: ws:build:deps # and a comment
                  browser: "true"
          steps:
            - run: pnpm run z:ci-job --command \${{ matrix.command }}
    `;

    assert.deepStrictEqual(
      readMatrixInclude(text),
      Result.ok([
        { command: 'ws:fix:lint:apps', build: 'ws:build:deps' },
        { command: 'ws:check:e2e:shard-2', build: 'ws:build', browser: 'true' },
        {
          command: 'ws:check:test:browser',
          build: 'ws:build:deps',
          browser: 'true',
        },
      ]),
    );
  });

  // What check-all runs and what check:root:ci-job-shape judges are read by the
  // one parser, so a comment or a leading `name:` reads the same in both.
  test('reads an entry that starts with `name:`, past a comment after `include:`', () => {
    const text = dedent`
      jobs:
        a:
          strategy:
            matrix:
              include: # the entries
                - name: first
                  command: check:md
                - name: second
                  command: check:prose
    `;

    assert.deepStrictEqual(
      readMatrixInclude(text),
      Result.ok([
        { name: 'first', command: 'check:md' },
        { name: 'second', command: 'check:prose' },
      ]),
    );
  });

  test('a matrix given as an expression is an error', () => {
    assert.isTrue(
      Result.isErr(
        readMatrixInclude(
          // eslint-disable-next-line no-template-curly-in-string -- a GitHub Actions expression, not a template.
          'jobs:\n  a:\n    strategy:\n      matrix: ${{ fromJSON(x) }}\n',
        ),
      ),
    );
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

    assert.deepStrictEqual(commandsOf(text), ['check:md', 'check:prose']);
  });

  test('reads the matrix keys a `z:ci-job` step hands on', () => {
    const text = dedent`
      jobs:
        code-check:
          strategy:
            matrix:
              include:
                - command: check:root
                  build: ws:build:deps
          steps:
            - run: pnpm run z:ci-job --build \${{ matrix.build }} --command \${{ matrix.command }}
    `;

    assert.deepStrictEqual(commandsOf(text), [
      'check:root',
      'ws:build:deps',
      'z:ci-job',
    ]);
  });

  test('reads a `pnpm run` inside a `run: |` block, flags and arguments aside', () => {
    const text = dedent`
      jobs:
        benchmark:
          steps:
            - name: Measure
              run: |
                git fetch --no-tags --depth=1 origin "\${BASE}"
                pnpm run --silent bench:run --out result.json
                # pnpm run not:this-one, a comment
                echo done && pnpm run bench:report
                echo '::error::then run pnpm run fmt, and commit the result.'
    `;

    assert.deepStrictEqual(commandsOf(text), ['bench:report', 'bench:run']);
  });

  test('reads a substitution, and an argument that looks like a package flag', () => {
    const text = dedent`
      jobs:
        a:
          steps:
            - run: |
                out="$(pnpm run --silent check:foo)"
                spaced="$( pnpm run check:spaced )"
                pnpm run gen:report --dir out
    `;

    assert.deepStrictEqual(commandsOf(text), [
      'check:foo',
      'check:spaced',
      'gen:report',
    ]);
  });

  test('leaves out prose, a step name and another program’s `run`', () => {
    const text = dedent`
      jobs:
        a:
          steps:
            - name: Then pnpm run check:named
              run: |
                echo "::error::Run pnpm run fix:quoted and commit"
                pnpm exec vitest run smoke
    `;

    assert.deepStrictEqual(commandsOf(text), []);
  });

  test('reads past an apostrophe in a string, and a flag that takes a value', () => {
    const text = dedent`
      jobs:
        a:
          steps:
            - run: echo "can't skip" && pnpm run check:after-quote
            - run: pnpm run --workspace-concurrency 4 check:concurrent
            - run: pnpm --reporter append-only run check:reported
    `;

    assert.deepStrictEqual(commandsOf(text), [
      'check:after-quote',
      'check:concurrent',
      'check:reported',
    ]);
  });

  test('leaves out a `pnpm run` in a template literal', () => {
    const text = dedent`
      jobs:
        a:
          steps:
            - uses: actions/github-script@v8
              with:
                script: |
                  core.setFailed(\`Run pnpm run fix:fmt and commit\`);
    `;

    assert.deepStrictEqual(commandsOf(text), []);
  });

  test('reads a `run:` value YAML quotes as a whole', () => {
    const text = dedent`
      jobs:
        a:
          steps:
            - run: 'pnpm run check:single'
            - run: "pnpm run check:double"
    `;

    assert.deepStrictEqual(commandsOf(text), ['check:double', 'check:single']);
  });

  test('keeps a `pnpm run` pointed at packages apart from the root scripts', () => {
    const text = dedent`
      jobs:
        docs:
          steps:
            - run: |
                pnpm --filter @synstate/docs run fix:fmt
                pnpm run --filter=a gen:x
                pnpm run -r check:types
                pnpm run --dir apps/x build
                pnpm --dir . run root:script
            - run: pnpm run in:package
              working-directory: apps/y
    `;

    const read = collectWorkflowCommands(text);

    assert.deepStrictEqual(read.commands, ['root:script']);

    assert.deepStrictEqual(read.packageRuns, [
      {
        scripts: ['fix:fmt'],
        filters: ['@synstate/docs'],
        directory: undefined,
      },
      { scripts: ['gen:x'], filters: ['a'], directory: undefined },
      { scripts: ['check:types'], filters: [], directory: undefined },
      { scripts: ['build'], filters: [], directory: 'apps/x' },
      { scripts: ['in:package'], filters: [], directory: 'apps/y' },
    ]);
  });

  test('reads what the shell runs, however a line is written', () => {
    const text = dedent`
      jobs:
        a:
          steps:
            - run: |
                out=\`pnpm run backtick\`
                echo "$(cd a && pnpm run in-quoted-substitution)"
                echo "a string
                over lines" && pnpm run after-string
                pnpm run \\
                  continued
                cat <<'EOF'
                pnpm run in-heredoc
                EOF
                echo done # then pnpm run commented
            - run: 'pnpm run quoted-value' # why
            - run: 'echo "can''t" && pnpm run after-apostrophe'
    `;

    assert.deepStrictEqual(commandsOf(text), [
      'after-apostrophe',
      'after-string',
      'backtick',
      'continued',
      'in-quoted-substitution',
      'quoted-value',
    ]);
  });

  test('reads a run behind a wrapper, `-w` from anywhere, and `--dir` from the working directory', () => {
    const text = dedent`
      jobs:
        a:
          steps:
            - run: env NODE_OPTIONS=--max-old-space-size=8192 pnpm run wrapped
            - run: pnpm -w run from-root
              working-directory: apps/x
            - run: pnpm --dir ../y run beside
              working-directory: apps/x
            - run: pnpm -r run everywhere
              working-directory: apps
    `;

    const read = collectWorkflowCommands(text);

    assert.deepStrictEqual(read.commands, ['from-root', 'wrapped']);

    assert.deepStrictEqual(read.packageRuns, [
      { scripts: ['beside'], filters: [], directory: 'apps/y' },
    ]);

    // pnpm picks `-r`'s packages under the working directory.
    assert.lengthOf(read.problems, 1);
  });

  test('`-w` with `-r` is a run in packages, and the root may be written `./`', () => {
    const text = dedent`
      jobs:
        a:
          steps:
            - run: pnpm -w -r run everywhere
              working-directory: apps
            - run: pnpm -r run from-root
              working-directory: ./
            - run: pnpm run at-root
              working-directory: \${{ github.workspace }}
            - run: pnpm -w --dir libs/a run w-over-dir
            - run: pnpm --dir ../ run up-to-root
              working-directory: apps/
    `;

    const read = collectWorkflowCommands(text);

    assert.deepStrictEqual(read.commands, [
      'at-root',
      'up-to-root',
      'w-over-dir',
    ]);

    assert.deepStrictEqual(read.packageRuns, [
      { scripts: ['everywhere'], filters: [], directory: undefined },
      { scripts: ['from-root'], filters: [], directory: undefined },
    ]);

    assert.deepStrictEqual(read.problems, []);
  });

  test('reads a matrix value handed on through a variable', () => {
    const text = dedent`
      jobs:
        a:
          strategy:
            matrix:
              include:
                - command: check:md
          steps:
            - env:
                COMMAND: \${{ matrix.command }}
              run: pnpm run "\${COMMAND}"
    `;

    assert.deepStrictEqual(commandsOf(text), ['check:md']);
  });

  test('a script it cannot name is a problem, not a run left out', () => {
    const text = dedent`
      jobs:
        a:
          strategy:
            matrix: \${{ fromJSON(needs.plan.outputs.matrix) }}
          steps:
            - run: pnpm run \${{ matrix.command }}
        b:
          steps:
            - run: pnpm run "$SCRIPT"
            - run: pnpm run \${{ matrix.absent }}
            - run: echo 'unterminated
    `;

    assert.lengthOf(collectWorkflowCommands(text).problems, 4);
  });

  test('reads the `include` entries of a matrix the workflow hands to `pnpm run`', () => {
    const text = dedent`
      jobs:
        code-check:
          strategy:
            matrix:
              include:
                # A comment is not an entry.
                - command: ws:fix:lint:apps
                  build: ws:build:deps

                - command: check:root
                  build: ws:build
                  browser: true
          steps:
            - run: pnpm run \${{ matrix.build }}
            - name: Run "\${{ matrix.command }}"
              run: pnpm run \${{ matrix.command }}
    `;

    assert.deepStrictEqual(commandsOf(text), [
      'check:root',
      'ws:build',
      'ws:build:deps',
      'ws:fix:lint:apps',
    ]);
  });

  test('reads every `include` block, not only the first', () => {
    const text = dedent`
      jobs:
        first:
          strategy:
            matrix:
              include:
                - command: check:md
          steps:
            - run: pnpm run \${{ matrix.command }}
        second:
          strategy:
            matrix:
              include:
                - command: check:prose
          steps:
            - run: pnpm run \${{ matrix.command }}
    `;

    assert.deepStrictEqual(commandsOf(text), ['check:md', 'check:prose']);
  });

  test('reads a step that names the script itself', () => {
    const text = dedent`
      jobs:
        build:
          steps:
            - name: Build all packages
              run: pnpm run ws:build
    `;

    assert.deepStrictEqual(commandsOf(text), ['ws:build']);
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

    assert.deepStrictEqual(commandsOf(text), ['ws:check:test']);
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

  test.each([
    ["--filter='./apps/**'", ['apps/x:check:types']],
    ["--filter='!./apps/**'", ['libs/a:check:types', 'libs/b:check:types']],
    ['--filter=a --filter=x', ['apps/x:check:types', 'libs/a:check:types']],
    ['--filter=!a', ['apps/x:check:types', 'libs/b:check:types']],
    ["--filter='./libs/**' --filter=!b", ['libs/a:check:types']],
  ] as const)(
    'a recursive run with %s reaches only what pnpm selects',
    (filters, reached) => {
      const graph = buildCoverageGraph([
        rootManifest({
          'ws:check:types': `pnpm run --recursive ${filters} --if-present check:types`,
        }),
        packageManifest('libs/a', { 'check:types': 'tsc --noEmit' }),
        packageManifest('libs/b', { 'check:types': 'tsc --noEmit' }),
        packageManifest('apps/x', { 'check:types': 'tsc --noEmit' }),
      ]);

      assert.deepStrictEqual(
        Array.from(graph.edges.get('.:ws:check:types') ?? []).toSorted(),
        Array.from(reached),
      );
    },
  );

  test('a filtered run without --recursive reaches the packages too', () => {
    const graph = buildCoverageGraph([
      rootManifest({
        'gen:x': 'pnpm run --filter a gen:x',
        'check:y': 'pnpm run --filter-prod=b check:y',
      }),
      packageManifest('libs/a', { 'gen:x': 'tsx x.mts' }),
      packageManifest('libs/b', { 'check:y': 'tsx y.mts' }),
    ]);

    assert.deepStrictEqual(Array.from(graph.edges.get('.:gen:x') ?? []), [
      'libs/a:gen:x',
    ]);

    assert.deepStrictEqual(Array.from(graph.edges.get('.:check:y') ?? []), [
      'libs/b:check:y',
    ]);
  });

  test('an unscoped name selects the scoped package of that name', () => {
    const graph = buildCoverageGraph([
      rootManifest({
        'ws:check:types': 'pnpm run --recursive --filter=cli check:types',
      }),
      {
        directory: 'languages/sumi/cli',
        name: '@sumi-lang/cli',
        scripts: { 'check:types': 'tsc --noEmit' },
      },
      packageManifest('libs/b', { 'check:types': 'tsc --noEmit' }),
    ]);

    assert.deepStrictEqual(
      Array.from(graph.edges.get('.:ws:check:types') ?? []),
      ['languages/sumi/cli:check:types'],
    );
  });

  test.each([
    [['cli', '@sumi-lang/cli'], ['libs/cli:check:types']],
    [['@a/cli', '@b/cli'], []],
  ] as const)(
    'among %j, an unscoped name falls back to a scope only when one alone matches',
    (names, reached) => {
      const graph = buildCoverageGraph(
        Arr.toUnshifted(
          rootManifest({
            'ws:check:types': 'pnpm run --recursive --filter=cli check:types',
          }),
        )(
          names.map((name) => ({
            directory: `libs/${name.replace('@', '').replace('/', '-')}`,
            name,
            scripts: { 'check:types': 'tsc --noEmit' },
          })),
        ),
      );

      assert.deepStrictEqual(
        Array.from(graph.edges.get('.:ws:check:types') ?? []),
        Array.from(reached),
      );
    },
  );

  // Read as every package, it would hide the gap in what the filter reaches.
  test('a selector of a form it does not read is a problem, not every package', () => {
    const graph = buildCoverageGraph([
      rootManifest({
        'ws:check:types': "pnpm run --recursive --filter='...a' check:types",
      }),
      packageManifest('libs/a', { 'check:types': 'tsc --noEmit' }),
      packageManifest('libs/b', { 'check:types': 'tsc --noEmit' }),
    ]);

    assert.strictEqual(graph.edges.get('.:ws:check:types'), undefined);

    assert.lengthOf(graph.problems, 1);
  });

  test('`.` selects the root, and no other selector does', () => {
    const graph = buildCoverageGraph([
      rootManifest({
        'gen:root': 'pnpm run --filter=. gen:x',
        'gen:all': 'pnpm run -r gen:x',
        'gen:x': 'tsx x.mts',
      }),
      packageManifest('libs/a', { 'gen:x': 'tsx x.mts' }),
    ]);

    assert.deepStrictEqual(Array.from(graph.edges.get('.:gen:root') ?? []), [
      '.:gen:x',
    ]);

    assert.deepStrictEqual(Array.from(graph.edges.get('.:gen:all') ?? []), [
      'libs/a:gen:x',
    ]);
  });

  test('`pnpm -w run` in a package reaches the root’s script', () => {
    const graph = buildCoverageGraph([
      rootManifest({ 'check:md': 'markdownlint .' }),
      packageManifest('libs/a', { 'check:all': 'pnpm -w run check:md' }),
    ]);

    assert.deepStrictEqual(
      Array.from(graph.edges.get('libs/a:check:all') ?? []),
      ['.:check:md'],
    );
  });

  test('a scoped selector falls back to no other scope', () => {
    const graph = buildCoverageGraph([
      rootManifest({
        'ws:check:types': "pnpm run --recursive --filter='@a/*' check:types",
      }),
      {
        directory: 'libs/cli',
        name: '@b/cli',
        scripts: { 'check:types': 'tsc --noEmit' },
      },
    ]);

    assert.strictEqual(graph.edges.get('.:ws:check:types'), undefined);
  });

  test('a `pnpm --dir` run reaches the script of the package it names', () => {
    const graph = buildCoverageGraph([
      packageManifest('apps/app', {
        'check:e2e': 'pnpm --dir ../functions run build && playwright test',
      }),
      packageManifest('apps/functions', { build: 'tsx build.mts' }),
    ]);

    assert.deepStrictEqual(
      Array.from(graph.edges.get('apps/app:check:e2e') ?? []),
      ['apps/functions:build'],
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

describe('resolvePackageRuns', () => {
  const manifests = [
    rootManifest({}),
    packageManifest('libs/a', { 'gen:x': 'tsx x.mts' }),
    {
      directory: 'apps/docs',
      name: '@s/docs',
      scripts: { 'fix:fmt': 'prettier --write .' },
    },
  ] as const;

  test('reaches the script in the packages a run is pointed at', () => {
    assert.deepStrictEqual(
      resolvePackageRuns(
        [
          { scripts: ['fix:fmt'], filters: ['@s/docs'], directory: undefined },
          { scripts: ['gen:x'], filters: [], directory: 'libs/a' },
          { scripts: ['gen:x'], filters: [], directory: undefined },
        ],
        manifests,
      ),
      { commands: ['apps/docs:fix:fmt', 'libs/a:gen:x'], problems: [] },
    );
  });

  test('a run that reaches no package defining the script is a problem', () => {
    assert.lengthOf(
      resolvePackageRuns(
        [
          { scripts: ['gone'], filters: ['@s/docs'], directory: undefined },
          {
            scripts: ['gen:x'],
            filters: [],
            // eslint-disable-next-line no-template-curly-in-string -- a GitHub Actions expression, not a template.
            directory: 'apps/${{ matrix.app }}',
          },
          { scripts: ['gen:x'], filters: ['...a'], directory: undefined },
        ],
        manifests,
      ).problems,
      3,
    );
  });
});
