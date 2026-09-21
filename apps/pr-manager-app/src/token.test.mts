import { Result } from 'ts-data-forge';
import {
  forgetToken,
  readToken,
  saveToken,
  type KeyValueStore,
  type TokenStores,
} from './token.mjs';

/**
 * A store built per test rather than cleared between them: this repository's
 * lint bans the `afterEach` that would do the clearing, and a fresh pair says
 * more plainly that no test can be reading what another one left.
 */
const memory = (): KeyValueStore & Readonly<{ size: () => number }> => {
  const mut_entries = new Map<string, string>();

  return {
    getItem: (key) => mut_entries.get(key) ?? null,
    setItem: (key, value) => {
      mut_entries.set(key, value);
    },
    removeItem: (key) => {
      mut_entries.delete(key);
    },
    size: () => mut_entries.size,
  };
};

const stores = (): TokenStores &
  Readonly<{ deviceSize: () => number; sessionSize: () => number }> => {
  const device = memory();

  const session = memory();

  return {
    device,
    session,
    deviceSize: device.size,
    sessionSize: session.size,
  };
};

describe('keeping the token', () => {
  test('is gone with the tab by default', () => {
    const both = stores();

    assert.deepStrictEqual(
      saveToken({ value: 'ghp_a', store: 'session' }, both),
      Result.ok(undefined),
    );

    assert.deepStrictEqual(readToken(both), {
      value: 'ghp_a',
      store: 'session',
    });

    // The default must not have written anything that survives the tab.
    expect(both.deviceSize()).toBe(0);
  });

  test('survives the tab only when the reader asks it to', () => {
    const both = stores();

    saveToken({ value: 'ghp_b', store: 'device' }, both);

    expect(both.deviceSize()).toBe(1);

    assert.deepStrictEqual(readToken(both), {
      value: 'ghp_b',
      store: 'device',
    });
  });

  // The failure this is here to prevent: a reader who turns off "remember"
  // believing the copy on their machine is gone, when only the tab's has been
  // replaced.
  test('leaves no copy behind when it moves between the two', () => {
    const both = stores();

    saveToken({ value: 'ghp_old', store: 'device' }, both);

    saveToken({ value: 'ghp_new', store: 'session' }, both);

    expect(both.deviceSize()).toBe(0);

    assert.deepStrictEqual(readToken(both), {
      value: 'ghp_new',
      store: 'session',
    });
  });

  test('clearing takes it out of both', () => {
    const both = stores();

    saveToken({ value: 'ghp_c', store: 'device' }, both);

    forgetToken(both);

    expect(readToken(both)).toBeUndefined();

    expect(both.deviceSize()).toBe(0);

    expect(both.sessionSize()).toBe(0);
  });

  test('is absent, not empty, when nothing was ever kept', () => {
    expect(readToken(stores())).toBeUndefined();
  });

  // A token typed into this tab is the one the reader is thinking about.
  test('prefers the tab over an older one left on the device', () => {
    const both = stores();

    saveToken({ value: 'ghp_device', store: 'device' }, both);

    // Written straight into the tab's store, which is what a second tab of
    // the same page would look like from here.
    both.session?.setItem(KEY, 'ghp_tab');

    assert.deepStrictEqual(readToken(both), {
      value: 'ghp_tab',
      store: 'session',
    });
  });

  // A browser with storage turned off is a browser the page still has to
  // work in: the token is refused a home and the reader is told so, rather
  // than the page failing to load.
  test('says so, once, when the browser will not store anything', () => {
    const none: TokenStores = {
      device: undefined,
      session: undefined,
    } as const;

    const saved = saveToken({ value: 'ghp_d', store: 'session' }, none);

    assert.isTrue(Result.isErr(saved));

    assert.isTrue(saved.value.includes('until the page is reloaded'));

    expect(readToken(none)).toBeUndefined();
  });
});

/**
 * The key is the module's own business, and this is the one test that has to
 * know it. Written out rather than exported, so that changing it stays a
 * decision about this file and not an interface other code can lean on.
 */
const KEY =
  'github-token--pr-manager-app--218bd917-a944-41cf-80a1-3436918878f8';
