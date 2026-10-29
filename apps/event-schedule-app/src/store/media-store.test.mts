import { createMediaStore, type MediaStore } from './media-store.mjs';

describe(createMediaStore, () => {
  test('starts as not mobile, and follows the media query once started', () => {
    const { store, media } = setup();

    assert.isFalse(media.isWatched());

    store.start();

    assert.isTrue(media.isWatched());

    media.change(true);

    assert.isTrue(store.isMobile$.getSnapshot().value);

    media.change(false);

    assert.isFalse(store.isMobile$.getSnapshot().value);
  });

  test('stop ends the watching', () => {
    const { store, media } = setup();

    const stopMedia = store.start();

    stopMedia();

    assert.isFalse(media.isWatched());

    media.change(true);

    assert.isFalse(store.isMobile$.getSnapshot().value);
  });
});

type FakeMedia = Readonly<{
  isWatched: () => boolean;
  change: (isMobile: boolean) => void;
}>;

const setup = (): Readonly<{ store: MediaStore; media: FakeMedia }> => {
  const mut_listeners = new Set<(isMobile: boolean) => void>();

  const store = createMediaStore({
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
        for (const listener of mut_listeners) {
          listener(isMobile);
        }
      },
    },
  } as const;
};
