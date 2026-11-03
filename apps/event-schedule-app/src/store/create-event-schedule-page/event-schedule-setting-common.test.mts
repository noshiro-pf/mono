import { createState } from 'synstate';
import {
  createEventScheduleSettingStore,
  type EventScheduleSettingUser,
} from './event-schedule-setting-common.mjs';

describe(createEventScheduleSettingStore, () => {
  test('makes the signed-in user the author', () => {
    const { store } = setup(alice);

    const { author } =
      store.commonState$.getSnapshot().value.eventScheduleNormalized;

    assert.deepStrictEqual([author.id, author.name], ['u1', 'alice']);
  });

  test('an event made while signed out has no author id', () => {
    const { store } = setup(undefined);

    const { author } =
      store.commonState$.getSnapshot().value.eventScheduleNormalized;

    assert.deepStrictEqual([author.id, author.name], [null, '']);
  });

  test('turning the notifications on fills in the signed-in user’s email', () => {
    const { store } = setup(alice);

    store.commonStateHandlers.toggleNotificationSection();

    assert.strictEqual(
      store.commonState$.getSnapshot().value.notificationSettingsWithEmail
        ?.email,
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
      store.commonState$.getSnapshot().value.answerDeadline,
      { year: 2027, month: 1, date: 17, hours: 23, minutes: 59 },
    );
  });

  test('follows the user signing in', () => {
    const { store, setUser } = setup(undefined);

    setUser(alice);

    assert.strictEqual(
      store.commonState$.getSnapshot().value.eventScheduleNormalized.author.id,
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
