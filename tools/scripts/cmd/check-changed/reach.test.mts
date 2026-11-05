import { Result } from 'ts-data-forge';
import {
  buildCoverageGraph,
  reachableFrom,
  type Manifest,
} from '../check-ci-commands.mjs';
import type { Step } from './plan.mjs';
import {
  CI_ONLY,
  findUncovered,
  matchesCiOnly,
  stepCommands,
} from './reach.mjs';

const step = (cwd: string, args: readonly string[]): Step =>
  ({ title: args.join(' '), kind: 'check', cwd, args }) as const;

describe('stepCommands', () => {
  const defined = new Set<string>([
    'libs/a:check:types',
    'libs/a:check:test',
    'libs/a:check:test:cov',
    '.:fix:codemod:affected',
    '.:z:format-diff-from',
    '.:check:root:a',
    '.:check:root:b',
  ]);

  test.each([
    [step('libs/a', ['run', 'check:types']), ['libs/a:check:types']],
    [step('.', ['run', 'fix:codemod:affected']), ['.:fix:codemod:affected']],
    [
      step('.', ['run', 'z:format-diff-from', 'abc123']),
      ['.:z:format-diff-from'],
    ],
    [step('libs/a', ['run', 'check:test']), ['libs/a:check:test']],
    [
      {
        ...step('libs/a', ['run', 'check:test']),
        coverage: { packageDir: 'libs/a' },
      },
      ['libs/a:check:test', 'libs/a:check:test:cov'],
    ],
    [
      step('.', [
        'exec',
        'run-p',
        '--continue-on-error',
        '--print-label',
        'check:root:a',
        'check:root:b',
      ]),
      ['.:check:root:a', '.:check:root:b'],
    ],
    [step('.', ['exec', 'cspell', '--no-progress', './a.md']), []],
  ] as const)('%j runs %j', (given, expected) => {
    assert.deepStrictEqual(stepCommands(given, defined), Result.ok(expected));
  });

  test('a step of an unknown form is an error, not nothing', () => {
    assert.isTrue(
      Result.isErr(stepCommands(step('.', ['exec', 'eslint', '.']), defined)),
    );
  });

  test.each([
    ['a flag in the script’s place', step('.', ['run', '--silent', 'x'])],
    ['a script its directory does not define', step('libs/a', ['run', 'gone'])],
    [
      'a listed script its directory does not define',
      step('.', ['exec', 'run-p', '--print-label', 'check:root:a', 'gone']),
    ],
    ['a list of nothing', step('.', ['exec', 'run-p', '--print-label'])],
  ] as const)('%s is an error', (_, given) => {
    assert.isTrue(Result.isErr(stepCommands(given, defined)));
  });
});

describe('findUncovered', () => {
  const manifests: readonly Manifest[] = [
    {
      directory: '.',
      scripts: {
        'ws:check:types':
          'node ./tools/scripts/cmd/assert-deps-built.mts --workspace && pnpm run --recursive --if-present check:types',
        'check:root': "pnpm run '/check:root:.*/'",
        'check:root:a': 'tsx a.mts',
        'check:root:b': 'tsx b.mts',
        'z:ci:bundle': 'run-s --continue-on-error ws:check:types check:root',
        'fix:affected': 'tsx affected.mts && pnpm run fix:fmt',
        'fix:fmt': 'prettier --write .',
        'loop:a': 'pnpm run loop:b',
        'loop:b': 'pnpm run loop:a',
      },
    },
    {
      directory: 'libs/x',
      scripts: {
        'check:types':
          'node ../../tools/scripts/cmd/assert-deps-built.mts && tsc --noEmit',
      },
    },
    {
      directory: 'languages/sumi/y',
      scripts: {
        'check:types':
          'node ../../../tools/scripts/cmd/assert-deps-built.mts && tsc --noEmit',
      },
    },
  ] as const;

  const graph = buildCoverageGraph(manifests);

  const uncovered = (
    entries: readonly string[],
    local: readonly string[],
  ): readonly string[] =>
    findUncovered({
      graph,
      manifests,
      ciEntries: entries.map((command) => ({
        origin: `w.yml: ${command}`,
        command,
      })),
      localReach: reachableFrom(graph, local),
    }).map(({ command }) => command);

  test('an aggregate is covered by running each of its parts', () => {
    assert.deepStrictEqual(
      uncovered(
        ['.:z:ci:bundle'],
        [
          'libs/x:check:types',
          'languages/sumi/y:check:types',
          '.:check:root:a',
          '.:check:root:b',
        ],
      ),
      [],
    );
  });

  test('a part not run locally is named, not its aggregate', () => {
    assert.deepStrictEqual(
      uncovered(
        ['.:z:ci:bundle'],
        ['libs/x:check:types', '.:check:root:a', '.:check:root:b'],
      ),
      ['languages/sumi/y:check:types'],
    );
  });

  test('a script with work of its own has to run itself', () => {
    assert.deepStrictEqual(uncovered(['.:fix:affected'], ['.:fix:fmt']), [
      '.:fix:affected',
    ]);

    assert.deepStrictEqual(
      uncovered(['.:fix:affected'], ['.:fix:affected']),
      [],
    );
  });

  test('a cycle of aggregates ends', () => {
    assert.deepStrictEqual(uncovered(['.:loop:a'], []), []);
  });

  test('each command is named with the first entry that reaches it', () => {
    assert.deepStrictEqual(
      findUncovered({
        graph,
        manifests,
        ciEntries: [
          { origin: 'first.yml: check:root', command: '.:check:root' },
          { origin: 'second.yml: z:ci:bundle', command: '.:z:ci:bundle' },
        ],
        localReach: reachableFrom(graph, [
          'libs/x:check:types',
          'languages/sumi/y:check:types',
        ]),
      }),
      [
        { command: '.:check:root:a', origin: 'first.yml: check:root' },
        { command: '.:check:root:b', origin: 'first.yml: check:root' },
      ],
    );
  });
});

describe('matchesCiOnly', () => {
  test('an entry without a directory applies to every package', () => {
    assert.isTrue(matches('apps/a:check:e2e'));
  });

  test('an entry with a directory applies to that one alone', () => {
    assert.isTrue(matches('.:verify:npm-packages'));

    assert.isFalse(matches('libs/a:verify:npm-packages'));
  });

  test('an entry ending in a slash applies to every package under it', () => {
    assert.isTrue(matches('strict-lib/v5.0:check:types'));

    assert.isFalse(matches('libs/a:check:types'));
  });
});

const matches = (command: string): boolean =>
  CI_ONLY.some((entry) => matchesCiOnly(entry, command));
