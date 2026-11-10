import { themeCodec } from '../domain/index.mjs';
import { manualTimers } from './timers.mjs';
import { createUrlStore } from './url-store.mjs';

const setup = (
  search: string,
): Readonly<{
  store: ReturnType<typeof createUrlStore>;
  timers: ReturnType<typeof manualTimers>;
  writes: readonly string[];
  search: () => string;
}> => {
  let mut_search = search;

  const timers = manualTimers();

  const mut_writes: string[] = [];

  const store = createUrlStore({
    read: () => mut_search,
    write: (next) => {
      mut_search = next;

      mut_writes.push(next);
    },
    timers,
    delayMs: 200,
  });

  return { store, timers, writes: mut_writes, search: () => mut_search };
};

describe(createUrlStore, () => {
  test('reads a field from the URL the page opened with', () => {
    const { store } = setup('?repo=a/b&theme=dark');

    assert.strictEqual(store.field(themeCodec).get(), 'dark');
  });

  test('writes a change after the delay, keeping what it does not own', () => {
    const { store, timers, writes, search } = setup('?repo=a/b&x=1');

    const theme = store.field(themeCodec);

    theme.set('light');

    theme.set('dark');

    assert.deepStrictEqual(writes, []);

    timers.advance(200);

    assert.deepStrictEqual(writes, ['?repo=a/b&x=1&theme=dark']);

    theme.set('auto');

    store.flush();

    assert.strictEqual(search(), '?repo=a/b&x=1');
  });
});
