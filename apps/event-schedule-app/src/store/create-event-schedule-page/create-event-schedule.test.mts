import type { Toaster } from '@blueprintjs/core';
import { EventSchedule } from 'event-schedule-app-shared';
import { createState } from 'synstate';
import { Result, asSafeUint } from 'ts-data-forge';
import {
  createCreateEventScheduleStore,
  type CreateEventSchedule,
} from './create-event-schedule.mjs';
import type { EventScheduleSettingUser } from './event-schedule-setting-common.mjs';

describe(createCreateEventScheduleStore, () => {
  test('creates the event with the signed-in user as its author, and gives its link', async () => {
    const { store, calls } = setup();

    fillValidEvent(store);

    store.onCreateEventClick();

    await settle(10);

    // Notifications are off unless turned on, so no email is kept.
    assert.deepStrictEqual(calls, [
      'add event alice u1',
      'storage.save (reset)',
    ]);

    store.onClipboardButtonClick();

    assert.strictEqual(
      calls.at(-1),
      'clipboard https://example.com/event/new-id/',
    );
  });

  test('keeps the author’s email for the notifications when they are on', async () => {
    const { store, calls } = setup();

    fillValidEvent(store);

    store.commonStateHandlers.toggleNotificationSection();

    store.onCreateEventClick();

    await settle(10);

    assert.deepStrictEqual(calls, [
      'add event alice u1',
      'setAuthorsEmail new-id alice@example.com',
      'storage.save (reset)',
    ]);
  });

  test('creates nothing while the settings are not valid', async () => {
    const { store, calls } = setup();

    store.onCreateEventClick();

    await settle(10);

    assert.deepStrictEqual(calls, []);
  });

  test('says so when the event cannot be added', async () => {
    const { store, toasts } = setup({ addFails: true });

    fillValidEvent(store);

    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    store.onCreateEventClick();

    await settle(10);

    consoleError.mockRestore();

    assert.strictEqual(toasts.count, 1);
  });

  test('keeps the settings in storage once they stay still, from the second change after start', async () => {
    const { store, calls } = setup();

    store.commonStateHandlers.setTitle('before start');

    await settle(saveDelayMs * 5);

    store.start();

    store.commonStateHandlers.setTitle('first');

    await settle(saveDelayMs * 5);

    store.commonStateHandlers.setTitle('second');

    await settle(saveDelayMs * 5);

    // `skip(1)` drops the first settled change after start, as it did when
    // the subscription was made on import: only the second is saved.
    assert.deepStrictEqual(calls, ['storage.save second']);
  });

  test('restores the settings, without the dates up to today', () => {
    const { store } = setup({
      stored: EventSchedule.fill({
        title: 'stored',
        datetimeRangeList: [rawDayOf(30), rawDayOf(31)],
        notificationSettings: 'none',
      }),
    });

    store.restoreFromLocalStorage();

    const state = store.commonState$.getSnapshot().value;

    assert.strictEqual(state.title, 'stored');

    assert.deepStrictEqual(
      state.datetimeRangeList.map((d) => d.ymd.date),
      [31],
    );
  });
});

const saveDelayMs = 10;

const alice: EventScheduleSettingUser = {
  uid: 'u1',
  displayName: 'alice',
  email: 'alice@example.com',
} as const;

type Setup = Readonly<{
  store: CreateEventSchedule;
  calls: readonly string[];
  toasts: Readonly<{ count: number }>;
}>;

const setup = (
  options?: Readonly<{ addFails?: boolean; stored?: EventSchedule }>,
): Setup => {
  const [fireAuthUser$] = createState<EventScheduleSettingUser | undefined>(
    alice,
  );

  const mut_calls: string[] = [];

  const mut_toasts = { count: 0 };

  const store = createCreateEventScheduleStore({
    api: {
      event: {
        add: (ev) => {
          mut_calls.push(`add ${ev.title} ${ev.author.name} ${ev.author.id}`);

          return Promise.resolve(
            options?.addFails === true
              ? Result.err('denied')
              : Result.ok('new-id'),
          );
        },
        setAuthorsEmail: (eventId, email) => {
          mut_calls.push(`setAuthorsEmail ${eventId} ${email}`);

          return Promise.resolve(Result.ok(undefined));
        },
      },
    },
    auth: { fireAuthUser$, getFireAuthUserSnapshot: () => alice },
    storage: {
      restore: () => Result.ok(options?.stored),
      save: (ev) => {
        mut_calls.push(
          `storage.save ${ev.title === '' ? '(reset)' : ev.title}`,
        );

        return Result.ok(undefined);
      },
    },
    writeToClipboard: (text) => {
      mut_calls.push(`clipboard ${text}`);

      return Promise.resolve();
    },
    toAbsolutePath: (relativePath) => {
      const url = new URL(relativePath, 'https://example.com/create/');

      return url.href;
    },
    now: () => ({
      year: asSafeUint(2026),
      month: 10,
      date: 30,
      hours: 12,
      minutes: 0,
    }),
    saveDelayMs,
    toast: Promise.resolve(
      fakeToaster(() => {
        mut_toasts.count += 1;

        return mut_toasts.count;
      }),
    ),
  });

  return { store, calls: mut_calls, toasts: mut_toasts } as const;
};

const fillValidEvent = (store: CreateEventSchedule): void => {
  store.commonStateHandlers.setTitle('event');

  store.commonStateHandlers.setDatetimeRangeList(
    EventSchedule.fill({ datetimeRangeList: [rawDayOf(31)] }).datetimeRangeList,
  );
};

/** A date of October 2026 as stored, before the codec reads it. */
const rawDayOf = (date: number): unknown =>
  ({
    ymd: { year: 2026, month: 10, date },
    timeRange: {
      start: { hours: 10, minutes: 0 },
      end: { hours: 12, minutes: 0 },
    },
  }) as const;

/** A toaster that only counts what it is asked to show. */
const fakeToaster = (onShow: () => number): Toaster =>
  ({
    show: () => `toast-${onShow()}`,
    dismiss: () => undefined,
    clear: () => undefined,
    getToasts: () => [],
  }) as const;

const settle = async (ms: number): Promise<void> => {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
};
