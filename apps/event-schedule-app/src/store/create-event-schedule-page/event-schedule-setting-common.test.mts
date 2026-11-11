import { createState } from 'synstate';
import { Optional } from 'ts-data-forge';
import {
  createEventScheduleSettingStore,
  type EventScheduleSettingUser,
} from './event-schedule-setting-common.mjs';

describe(createEventScheduleSettingStore, () => {
  test('makes the signed-in user the author', () => {
    const { store } = setup(alice);

    const { author } = Optional.unwrap(
      store.commonState$.getSnapshot(),
    ).eventScheduleNormalized;

    assert.deepStrictEqual([author.id, author.name], ['u1', 'alice']);
  });

  test('an event made while signed out has no author id', () => {
    const { store } = setup(undefined);

    const { author } = Optional.unwrap(
      store.commonState$.getSnapshot(),
    ).eventScheduleNormalized;

    assert.deepStrictEqual([author.id, author.name], [null, '']);
  });

  test('turning the notifications on fills in the signed-in user’s email', () => {
    const { store } = setup(alice);

    store.commonStateHandlers.toggleNotificationSection();

    assert.strictEqual(
      Optional.unwrap(store.commonState$.getSnapshot())
        .notificationSettingsWithEmail?.email,
      'alice@example.com',
    );
  });

  test('turning the answer deadline on proposes a week from the day it is turned on', () => {
    // The store is made on 3 November; the deadline is turned on on 10 January.
    const { store } = onDay(new Date(2026, 10, 3, 9, 0), () => setup(alice));

    onDay(new Date(2027, 0, 10, 9, 0), () => {
      store.commonStateHandlers.toggleAnswerDeadlineSection();
    });

    assert.deepStrictEqual(
      Optional.unwrap(store.commonState$.getSnapshot()).answerDeadline,
      { year: 2027, month: 1, date: 17, hours: 23, minutes: 59 },
    );
  });

  test('follows the user signing in', () => {
    const { store, setUser } = setup(undefined);

    setUser(alice);

    assert.strictEqual(
      Optional.unwrap(store.commonState$.getSnapshot()).eventScheduleNormalized
        .author.id,
      'u1',
    );
  });
});

const alice: EventScheduleSettingUser = {
  uid: 'u1',
  displayName: 'alice',
  email: 'alice@example.com',
} as const;

const setup = (
  user: EventScheduleSettingUser | undefined,
): Readonly<{
  store: ReturnType<typeof createEventScheduleSettingStore>;
  setUser: (next: EventScheduleSettingUser | undefined) => void;
}> => {
  const [fireAuthUser$, setUser] = createState<
    EventScheduleSettingUser | undefined
  >(user);

  return {
    store: createEventScheduleSettingStore({ fireAuthUser$ }),
    setUser,
  } as const;
};

/** Runs `fn` with the clock on `date`. */
const onDay = <R,>(date: Date, fn: () => R): R => {
  vi.useFakeTimers({ toFake: ['Date'] });

  try {
    vi.setSystemTime(date);

    return fn();
  } finally {
    vi.useRealTimers();
  }
};
