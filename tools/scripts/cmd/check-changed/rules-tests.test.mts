import { findRulesTestNotes } from './rules-tests.mjs';

describe(findRulesTestNotes, () => {
  const packages = [
    {
      name: 'task-manager-app',
      dir: 'apps/task-manager',
      scripts: new Set<string>(['check:test', 'check:test:rules']),
    },
    {
      name: 'profile',
      dir: 'apps/profile',
      scripts: new Set<string>(['check:test']),
    },
  ] as const;

  test.each([
    'apps/task-manager/firestore.rules',
    'apps/task-manager/test/rules.test.mts',
    'apps/task-manager/configs/vitest.rules.config.mts',
  ])('notes a change to %s', (file) => {
    const notes = findRulesTestNotes([file], packages);

    expect(notes).toHaveLength(1);

    expect(notes[0]).toContain(
      'pnpm --filter task-manager-app run check:test:rules',
    );
  });

  test('says nothing of other files, or of a package with no rules tests', () => {
    assert.deepStrictEqual(
      findRulesTestNotes(
        [
          'apps/task-manager/src/app.tsx',
          'apps/task-manager/firestore.indexes.json',
          'apps/profile/test/page.test.mts',
        ],
        packages,
      ),
      [],
    );
  });
});
