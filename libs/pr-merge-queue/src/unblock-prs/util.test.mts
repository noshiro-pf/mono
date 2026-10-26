import { headShaFromListing } from './util.mjs';

describe(headShaFromListing, () => {
  const listing = [
    '870363ea81583350b5f32664fa27c27fd7b6c9b2\trefs/heads/changeset-release/main',
    '71f48d84b3fffa6a45b654836e9357153e1e949e\trefs/heads/main',
  ].join('\n');

  test('reads the branch named, not one whose name ends with it', () => {
    assert.strictEqual(
      headShaFromListing(listing, 'main'),
      '71f48d84b3fffa6a45b654836e9357153e1e949e',
    );

    assert.strictEqual(
      headShaFromListing(listing, 'changeset-release/main'),
      '870363ea81583350b5f32664fa27c27fd7b6c9b2',
    );
  });

  test('is undefined for a branch the listing does not have', () => {
    assert.isUndefined(headShaFromListing(listing, 'release/main'));

    assert.isUndefined(headShaFromListing('', 'main'));
  });
});
