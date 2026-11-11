import { Optional } from 'ts-data-forge';
import { createMediaStore, type MediaStore } from './media-store.mjs';

describe(createMediaStore, () => {
  test('starts as mobile when the media query matches on creation', () => {
    const { store } = setup(true);

    assert.isTrue(Optional.unwrap(store.isMobile$.getSnapshot()));
  });

  test('starts as not mobile when the media query does not match on creation', () => {
    const { store } = setup(false);

    assert.isFalse(Optional.unwrap(store.isMobile$.getSnapshot()));
  });

  test('takes up a change made before the first start', () => {
    const { store, media } = setup(false);

    media.resize(true);

    assert.isFalse(Optional.unwrap(store.isMobile$.getSnapshot()));

    store.start();

    assert.isTrue(Optional.unwrap(store.isMobile$.getSnapshot()));
  });

  test('takes up a change made between a stop and the next start', () => {
    const { store, media } = setup(true);

    const stopMedia = store.start();

    stopMedia();

    media.resize(false);

    assert.isTrue(Optional.unwrap(store.isMobile$.getSnapshot()));

    store.start();

    assert.isFalse(Optional.unwrap(store.isMobile$.getSnapshot()));
  });

  test('follows the media query once started', () => {
    const { store, media } = setup(false);

    assert.isFalse(media.isWatched());

    store.start();

    assert.isTrue(media.isWatched());

    media.change(true);

    assert.isTrue(Optional.unwrap(store.isMobile$.getSnapshot()));

    media.change(false);

    assert.isFalse(Optional.unwrap(store.isMobile$.getSnapshot()));
  });

  test('stop ends the watching', () => {
    const { store, media } = setup(false);

    const stopMedia = store.start();

    stopMedia();

    assert.isFalse(media.isWatched());

    media.change(true);

    assert.isFalse(Optional.unwrap(store.isMobile$.getSnapshot()));
  });
});

type FakeMedia = Readonly<{
  isWatched: () => boolean;
  /** The media query starts or stops matching, and the listeners hear it. */
  change: (isMobile: boolean) => void;
  /** The media query starts or stops matching while nothing listens. */
  resize: (isMobile: boolean) => void;
}>;

const setup = (
  isMobileAtFirst: boolean,
): Readonly<{ store: MediaStore; media: FakeMedia }> => {
  const mut_listeners = new Set<(isMobile: boolean) => void>();

  let mut_matches = isMobileAtFirst;

  const store = createMediaStore({
    isMobile: () => mut_matches,
    watchIsMobile: (onChange) => {
      mut_listeners.add(onChange);

      return () => {
        mut_listeners.delete(onChange);
      };
    },
  });

  return {
    store,
    media: {
      isWatched: () => mut_listeners.size > 0,
      change: (isMobile) => {
        mut_matches = isMobile;

        for (const listener of mut_listeners) {
          listener(isMobile);
        }
      },
      resize: (isMobile) => {
        mut_matches = isMobile;
      },
    },
  } as const;
};
