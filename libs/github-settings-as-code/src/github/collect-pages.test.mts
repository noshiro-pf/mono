import { collectPages } from './collect-pages.mjs';

describe(collectPages, () => {
  test('reads pages until one is shorter than a full page', async () => {
    const pages = [[1, 2], [3, 4], [5]] as const;

    const mut_requested: number[] = [];

    const items = await collectPages((page) => {
      mut_requested.push(page);

      return Promise.resolve(pages[page - 1] ?? []);
    }, 2);

    assert.deepStrictEqual(items, [1, 2, 3, 4, 5]);

    assert.deepStrictEqual(mut_requested, [1, 2, 3]);
  });

  test('reads one more, empty page when the last one is full', async () => {
    const pages = [[1, 2]] as const;

    const items = await collectPages(
      (page) => Promise.resolve(pages[page - 1] ?? []),
      2,
    );

    assert.deepStrictEqual(items, [1, 2]);
  });
});
