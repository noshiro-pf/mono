import { Result } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import {
  generatorEntries,
  generatorReadersOf,
  readGeneratorMembers,
  workspaceLibraries,
} from './generator-entries.mjs';
import type { WorkspaceLibrary } from './import-graph.mjs';
import { readPackages } from './packages.mjs';

const entriesOf = (
  scripts: ReadonlyRecord<string, string>,
): readonly string[] => {
  const entries = generatorEntries({
    dir: 'libs/pkg',
    scripts: new Map(Object.entries(scripts)),
  });

  if (Result.isErr(entries)) {
    throw new Error(entries.value);
  }

  return entries.value;
};

describe('generatorEntries', () => {
  test('follows `gen` through run-s, run-p and pnpm run to what tsx and node run', () => {
    assert.deepStrictEqual(
      entriesOf({
        gen: 'run-s gen:types gen:docs',
        'gen:types':
          'tsx --tsconfig ../../tools/configs/tsconfig.tsx.json ./scripts/cmd/gen-types.mts',
        'gen:docs': 'run-p "gen:docs:*"',
        'gen:docs:a': 'pnpm run z:a',
        'gen:docs:b': 'node ../../tools/configs/b.mts --all',
        'z:a': 'tsx ./scripts/a.mts && pnpm run fix:fmt',
        'fix:fmt': 'prettier --write .',
        'gen:unused': 'tsx ./scripts/unused.mts',
      }),
      [
        'libs/pkg/scripts/a.mts',
        'libs/pkg/scripts/cmd/gen-types.mts',
        'tools/configs/b.mts',
      ],
    );
  });

  test.each([
    ['pnpm --filter other run gen', 'a filtered run'],
    ['pnpm -w run gen:x', 'a root run'],
    ['pnpm run --recursive gen', 'a recursive run'],
    ['tsx --tsconfig ./tsconfig.json', 'no script'],
    ['node --version', 'a flag alone'],
    ['eslint ./src', 'another program'],
  ])('`%s` names no entry: %s', (gen) => {
    assert.deepStrictEqual(entriesOf({ gen, 'gen:x': 'tsx ./x.mts' }), []);
  });

  test('a script that runs itself is read once', () => {
    assert.deepStrictEqual(
      entriesOf({ gen: 'run-s gen gen:x', 'gen:x': 'tsx ./x.mts' }),
      ['libs/pkg/x.mts'],
    );
  });

  test('reads past a value-taking flag of node', () => {
    assert.deepStrictEqual(
      entriesOf({ gen: 'node --loader tsx --env-file .env ./scripts/gen.tsx' }),
      ['libs/pkg/scripts/gen.tsx'],
    );
  });

  test('is an error, not an empty list, for a script it cannot read', () => {
    assert.isTrue(
      Result.isErr(
        generatorEntries({
          dir: 'libs/pkg',
          scripts: new Map<string, string>([['gen', 'tsx "./x.mts']]),
        }),
      ),
    );
  });

  test('a member with no `gen` has none', () => {
    assert.deepStrictEqual(entriesOf({ 'gen:x': 'tsx ./x.mts' }), []);
  });
});

describe('generatorReadersOf', () => {
  test('reads nothing when no file changed outside the members', () => {
    assert.deepStrictEqual(
      generatorReadersOf({
        members: [{ dir: 'libs/pkg', entries: ['libs/pkg/x.mts'] }],
        changed: [],
        libraries: new Map<string, WorkspaceLibrary>(),
      }),
      Result.ok(new Map<string, readonly string[]>()),
    );
  });

  // Against the repository: every member whose generators import the shared
  // module is found, whatever their number.
  test('finds every member whose generators import a shared module under tools/configs/', async () => {
    const packages = await readPackages();

    const read = await readGeneratorMembers(packages);

    if (Result.isErr(read)) {
      throw new Error(read.value);
    }

    const members = read.value;

    const libraries = workspaceLibraries(packages);

    const ruleTypes = 'tools/configs/gen-eslint-plugin-rule-types.mts';

    const readers = generatorReadersOf({
      members,
      changed: [ruleTypes],
      libraries,
    });

    if (Result.isErr(readers)) {
      throw new Error(readers.value);
    }

    // Every member whose `gen` runs a `gen:rule-types` script, which is what
    // imports the module.
    const expected = packages
      .filter(
        ({ scripts }) => scripts.has('gen') && scripts.has('gen:rule-types'),
      )
      .map(({ dir }) => dir);

    assert.isNotEmpty(expected);

    assert.includeMembers(Array.from(readers.value.keys()), expected);

    for (const files of readers.value.values()) {
      assert.deepStrictEqual(files, [ruleTypes]);
    }

    // A generator of a library the walk does not follow by name, reaching a
    // shared module through its own package's barrel.
    const embedUtils = 'tools/configs/embed-examples-utils.mts';

    const typeForge = generatorReadersOf({
      members,
      changed: [embedUtils],
      libraries,
    });

    if (Result.isErr(typeForge)) {
      throw new Error(typeForge.value);
    }

    assert.deepStrictEqual(typeForge.value.get('libs/ts-type-forge'), [
      embedUtils,
    ]);

    // A module that a command run by a relative path into another member
    // imports: every member running the command reads it, the command's own
    // member aside.
    const cliVersion = 'libs/ts-repo-utils/src/cmd/cli-version.mts';

    const genIndex = 'libs/ts-repo-utils/src/cmd/gen-index-ts.mts';

    // One program for both: the command, an entry outside the members that run
    // it, and a module it imports.
    const indexReaders = generatorReadersOf({
      members,
      changed: [cliVersion, genIndex],
      libraries,
    });

    if (Result.isErr(indexReaders)) {
      throw new Error(indexReaders.value);
    }

    const runIt = members
      .filter(
        ({ dir, entries }) =>
          dir !== 'libs/ts-repo-utils' && entries.includes(genIndex),
      )
      .map(({ dir }) => dir);

    assert.isNotEmpty(runIt);

    assert.includeMembers(Array.from(indexReaders.value.keys()), runIt);

    assert.isFalse(indexReaders.value.has('libs/ts-repo-utils'));

    for (const dir of runIt) {
      assert.deepStrictEqual(indexReaders.value.get(dir), [
        cliVersion,
        genIndex,
      ]);
    }
  }, 60_000);
});

describe('workspaceLibraries', () => {
  test('gives each member the members it may run, as its manifest names them', async () => {
    const libraries = workspaceLibraries(await readPackages());

    const dependencies = libraries.get('synstate-dom')?.dependencies ?? [];

    // A peer with a plain range, linked to the workspace's by a `workspace:`
    // devDependency.
    assert.isTrue(dependencies.includes('synstate'));

    // External peers are no member.
    assert.isFalse(dependencies.includes('react'));
  }, 60_000);
});
