import { findProfileDateNotes } from './profile-date.mjs';

describe(findProfileDateNotes, () => {
  test.each([
    'apps/profile/src/assets/biography.mdx',
    'apps/profile/src/assets/career.mdx',
    'apps/profile/src/assets/products.mts',
    'apps/profile/src/assets/writings.mts',
  ])('notes a change to %s that leaves the date alone', (file) => {
    const notes = findProfileDateNotes([file]);

    expect(notes).toHaveLength(1);

    expect(notes[0]).toContain('set `lastUpdatedAt`');
  });

  test('says nothing when the date changed with the content', () => {
    assert.deepStrictEqual(
      findProfileDateNotes([
        'apps/profile/src/assets/products.mts',
        'apps/profile/src/assets/last-updated.mts',
      ]),
      [],
    );
  });

  test('says nothing of other files of the app', () => {
    assert.deepStrictEqual(
      findProfileDateNotes([
        'apps/profile/src/components/last-updated.tsx',
        'apps/profile/src/assets/images/x.png',
        'apps/profile/src/assets/nested/page.mdx',
        'apps/other/src/assets/biography.mdx',
      ]),
      [],
    );
  });
});
