import { source } from 'synstate';
import { Optional } from 'ts-data-forge';
import { createMediaStore } from './media-store.mjs';

describe(createMediaStore, () => {
  test('follows the query while started', () => {
    let mut_matches = false;

    const change = source<undefined>();

    const store = createMediaStore({ matches: () => mut_matches, change });

    const stopMedia = store.start();

    mut_matches = true;

    change.next(undefined);

    assert.isTrue(Optional.unwrap(store.matches.getSnapshot()));

    stopMedia();

    mut_matches = false;

    change.next(undefined);

    assert.isTrue(Optional.unwrap(store.matches.getSnapshot()));
  });
});
