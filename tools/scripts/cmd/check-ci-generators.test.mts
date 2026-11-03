import dedent from 'dedent';
import {
  ciGenerators,
  collectCleanTreeJobCommands,
  plannedRootGenerators,
} from './check-ci-generators.mjs';

describe('collectCleanTreeJobCommands', () => {
  const workflow = dedent`
    name: Check

    on:
      pull_request:

    jobs: # two of them
      build:
        runs-on: ubuntu-latest
        # Unlike check, this job never runs z:assert-repo-is-clean.
        steps:
          - run: pnpm run gen:outside

      check:
        strategy:
          matrix:
            command:
              - gen:in-matrix
              - check:md
        steps:
          - run: pnpm run \${{ matrix.command }}
          # pnpm run gen:in-comment
          - run: |
              pnpm run gen:in-block
              pnpm run --silent gen:with-arguments -- --check
              pnpm run --recursive --if-present gen
              pnpm run --filter=docs gen:readme
              echo done
          - run: pnpm run z:assert-repo-is-clean
  `;

  test('reads only the jobs that assert a clean tree', () => {
    assert.deepStrictEqual(collectCleanTreeJobCommands(workflow), [
      [
        'check:md',
        'gen:in-block',
        'gen:in-matrix',
        'gen:with-arguments',
        'z:assert-repo-is-clean',
      ],
    ]);
  });

  test('a workflow with no such job yields nothing', () => {
    assert.deepStrictEqual(
      collectCleanTreeJobCommands(
        dedent`
          jobs:
            build:
              steps:
                - run: pnpm run gen:outside
        `,
      ),
      [],
    );
  });
});

describe('ciGenerators', () => {
  const scripts = {
    'gen:a': 'tsx a.mts',
    'gen:b': 'tsx b.mts',
    'gen:unreached': 'tsx c.mts',
    'z:both': 'run-s gen:b check:x',
    'check:x': 'tsx x.mts',
    'check:all': "pnpm run '/check:.*/'",
    'verify:npm-packages': 'tsx verify.mts',
    'gen:verify-npm-packages': 'tsx verify.mts --gen',
  } as const;

  test('follows the root scripts to the gen:* scripts they run', () => {
    assert.deepStrictEqual(ciGenerators(['gen:a', 'z:both'], scripts), [
      'gen:a',
      'gen:b',
    ]);
  });

  test('a script that writes under another name counts as its generator', () => {
    assert.deepStrictEqual(ciGenerators(['verify:npm-packages'], scripts), [
      'gen:verify-npm-packages',
    ]);
  });

  test('a command that reaches no generator yields none', () => {
    assert.deepStrictEqual(ciGenerators(['check:all', 'missing'], scripts), []);
  });
});

describe('plannedRootGenerators', () => {
  test('holds the root generators plan.mts wires to an area', () => {
    assert.includeMembers(Array.from(plannedRootGenerators()), [
      'gen:deps-graph',
      'gen:license-files',
      'gen:verify-npm-packages',
    ]);
  });

  test('holds no package script', () => {
    assert.isFalse(plannedRootGenerators().has('gen'));
  });
});
