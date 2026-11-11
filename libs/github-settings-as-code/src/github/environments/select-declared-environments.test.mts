import { selectDeclaredEnvironments } from './select-declared-environments.mjs';

describe(selectDeclaredEnvironments, () => {
  test('keeps the live environments that are declared, with their files', () => {
    const live = [
      { name: 'npm-publish', wait_timer: 0 },
      { name: 'made-in-the-ui', wait_timer: 0 },
      { name: 'github-pages', wait_timer: 5 },
    ] as const;

    const declared = [
      { file: '/d/github-pages.json', value: { name: 'github-pages' } },
      { file: '/d/npm-publish.json', value: { name: 'npm-publish' } },
    ] as const;

    assert.deepStrictEqual(selectDeclaredEnvironments(live, declared), [
      {
        file: '/d/npm-publish.json',
        environment: { name: 'npm-publish', wait_timer: 0 },
      },
      {
        file: '/d/github-pages.json',
        environment: { name: 'github-pages', wait_timer: 5 },
      },
    ]);
  });

  test('matches a name without case, and keeps the declared file', () => {
    assert.deepStrictEqual(
      selectDeclaredEnvironments(
        [{ name: 'production' }],
        [{ file: '/d/Production.json', value: { name: 'Production' } }],
      ),
      [{ file: '/d/Production.json', environment: { name: 'production' } }],
    );
  });

  test('writes nothing back when nothing is declared', () => {
    assert.deepStrictEqual(
      selectDeclaredEnvironments([{ name: 'made-in-the-ui' }], []),
      [],
    );
  });
});
