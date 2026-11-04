import { selectDeclaredEnvironments } from './select-declared-environments.mjs';

describe(selectDeclaredEnvironments, () => {
  test('keeps the live environments that are declared, by name', () => {
    const live = [
      { name: 'npm-publish', wait_timer: 0 },
      { name: 'made-in-the-ui', wait_timer: 0 },
      { name: 'github-pages', wait_timer: 5 },
    ] as const;

    const declared = [
      { name: 'github-pages' },
      { name: 'npm-publish' },
    ] as const;

    assert.deepStrictEqual(selectDeclaredEnvironments(live, declared), [
      { name: 'npm-publish', wait_timer: 0 },
      { name: 'github-pages', wait_timer: 5 },
    ]);
  });

  test('writes nothing back when nothing is declared', () => {
    assert.deepStrictEqual(
      selectDeclaredEnvironments([{ name: 'made-in-the-ui' }], []),
      [],
    );
  });
});
