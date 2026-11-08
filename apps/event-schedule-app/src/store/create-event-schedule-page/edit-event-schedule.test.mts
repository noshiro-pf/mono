import { EventSchedule, NotificationSettings } from 'event-schedule-app-shared';
import { createState } from 'synstate';
import { createMemoryBrowser } from 'synstate-router';
import { Result } from 'ts-data-forge';
import { answerIconsInitialValue, routes } from '../../constants/index.mjs';
import { createAppRouter, type AppRouter } from '../router-store.mjs';
import {
  createEditEventScheduleStore,
  type EditEventSchedule,
} from './edit-event-schedule.mjs';
import type { EventScheduleSettingUser } from './event-schedule-setting-common.mjs';

describe(createEditEventScheduleStore, () => {
  test('has no changes once the event from the database is set', () => {
    const { store } = setup();

    store.setEventSchedule(fromDatabase, undefined);

    assert.isTrue(store.hasNoChanges$.getSnapshot().value);

    store.commonStateHandlers.setTitle('renamed');

    assert.isFalse(store.hasNoChanges$.getSnapshot().value);

    assert.isDefined(store.diff$.getSnapshot().value.title);
  });

  // #3416: the form outlived the visit, and another event's edit page showed it
  // until its own event was read.
  test('leaving the edit page forgets the form and the event it was loaded from', () => {
    const { store, router } = setup();

    store.setEventSchedule(fromDatabase, undefined);

    store.commonStateHandlers.setTitle('renamed');

    router.push(routes.event.answer.href({ eventId: 'abc' }));

    router.push(routes.event.answer.edit.href({ eventId: 'other' }));

    const { title, datetimeRangeList } = store.commonState$.getSnapshot().value;

    assert.strictEqual(title, '');

    assert.notDeepEqual(datetimeRangeList, fromDatabase.datetimeRangeList);

    // Nothing is compared with the event left, either.
    assert.isUndefined(store.diff$.getSnapshot().value.title);
  });

  test('a date taken out is a deleted change', () => {
    const { store } = setup();

    store.setEventSchedule(fromDatabase, undefined);

    store.commonStateHandlers.setDatetimeRangeList(
      fromDatabase.datetimeRangeList.slice(1),
    );

    assert.isTrue(store.hasDeletedDatetimeChanges$.getSnapshot().value);
  });

  test('saves the event as the database has its author and archivers, then goes back', async () => {
    const { store, calls, browser, toasts } = setup();

    store.setEventSchedule(fromDatabase, undefined);

    store.commonStateHandlers.setTitle('renamed');

    await store.onEditEventClickPromise();

    assert.deepStrictEqual(calls, [
      'update abc renamed bob',
      'refetch answers',
      'refetch event',
    ]);

    assert.strictEqual(browser.url().pathname, '/event/abc/');

    await settle();

    assert.strictEqual(toasts.count, 1);
  });

  test('stays on the page and says so when the event cannot be saved', async () => {
    const { store, calls, browser, toasts } = setup({ updateFails: true });

    store.setEventSchedule(fromDatabase, undefined);

    store.commonStateHandlers.setTitle('renamed');

    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    await store.onEditEventClickPromise();

    consoleError.mockRestore();

    assert.deepStrictEqual(calls, ['update abc renamed bob']);

    assert.strictEqual(browser.url().pathname, '/event/abc/edit/');

    await settle();

    assert.strictEqual(toasts.count, 1);
  });

  test('with notifications on, saves the email too', async () => {
    const { store, calls } = setup();

    store.setEventSchedule(withNotifications, 'bob@example.com');

    store.commonStateHandlers.setTitle('renamed');

    await store.onEditEventClickPromise();

    assert.deepStrictEqual(calls, [
      'update abc renamed bob',
      'setAuthorsEmail abc bob@example.com',
      'refetch answers',
      'refetch event',
    ]);
  });

  test('stays on the page when the email cannot be saved', async () => {
    const { store, calls, browser } = setup({ emailFails: true });

    store.setEventSchedule(withNotifications, 'bob@example.com');

    store.commonStateHandlers.setTitle('renamed');

    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    await store.onEditEventClickPromise();

    consoleError.mockRestore();

    assert.deepStrictEqual(calls, [
      'update abc renamed bob',
      'setAuthorsEmail abc bob@example.com',
    ]);

    assert.strictEqual(browser.url().pathname, '/event/abc/edit/');
  });

  test('an email confirmed on one event is not taken for the next one', () => {
    const { store, router } = setup();

    store.setEmailVerified('abc', 'bob@example.com');

    store.setEventSchedule(withNotifications, 'bob@example.com');

    assert.isTrue(store.hasNoChanges$.getSnapshot().value);

    // Another event, with no notifications and so no email to confirm.
    router.push(routes.event.answer.edit.href({ eventId: 'xyz' }));

    assert.isUndefined(store.emailVerified$.getSnapshot().value);

    store.setEventSchedule(fromDatabase, undefined);

    assert.isTrue(store.hasNoChanges$.getSnapshot().value);

    assert.isUndefined(store.diff$.getSnapshot().value.notificationSettings);
  });

  test('a confirmed email is forgotten once the edit page is left', () => {
    const { store, router } = setup();

    store.setEmailVerified('abc', 'bob@example.com');

    assert.strictEqual(
      store.emailVerified$.getSnapshot().value,
      'bob@example.com',
    );

    // Saved with the notifications turned off, then edited again: the event
    // asks for no email, and the one confirmed before is not taken.
    router.push(routes.event.answer.href({ eventId: 'abc' }));

    router.push(routes.event.answer.edit.href({ eventId: 'abc' }));

    assert.isUndefined(store.emailVerified$.getSnapshot().value);

    store.setEventSchedule(fromDatabase, undefined);

    assert.isTrue(store.hasNoChanges$.getSnapshot().value);
  });

  test('the notification settings of one event are not kept for the next one', () => {
    const { store, router } = setup();

    store.setEventSchedule(withNotifications, undefined);

    router.push(routes.event.answer.edit.href({ eventId: 'xyz' }));

    store.setEventSchedule(fromDatabase, undefined);

    assert.isUndefined(
      store.commonState$.getSnapshot().value.notificationSettingsWithEmail,
    );

    assert.isTrue(store.hasNoChanges$.getSnapshot().value);
  });

  test('an answer deadline of one event is not kept for the next one', () => {
    const { store, router } = setup();

    store.setEventSchedule(withAnswerDeadline, undefined);

    assert.isTrue(store.hasNoChanges$.getSnapshot().value);

    router.push(routes.event.answer.edit.href({ eventId: 'xyz' }));

    store.setEventSchedule(fromDatabase, undefined);

    assert.isTrue(store.hasNoChanges$.getSnapshot().value);

    assert.isUndefined(store.diff$.getSnapshot().value.answerDeadline);
  });

  test('the back button goes to the answer page', () => {
    const { store, browser } = setup();

    store.onBackToAnswerPage();

    assert.strictEqual(browser.url().pathname, '/event/abc/');
  });
});

/**
 * Made by bob; alice, signed in, is editing it. Saved by the app, so already as
 * the settings normalize it (notes end in a line break).
 */
const fromDatabase: EventSchedule = EventSchedule.fill({
  title: 'event',
  notes: 'memo\n',
  author: { id: 'u2', name: 'bob' },
  // The schema's default leaves every description empty, which the settings
  // page does not let the user save.
  answerIcons: answerIconsInitialValue,
  datetimeRangeList: [
    {
      ymd: { year: 2026, month: 11, date: 1 },
      timeRange: {
        start: { hours: 10, minutes: 0 },
        end: { hours: 12, minutes: 0 },
      },
    },
    {
      ymd: { year: 2026, month: 11, date: 2 },
      timeRange: {
        start: { hours: 10, minutes: 0 },
        end: { hours: 12, minutes: 0 },
      },
    },
  ],
  notificationSettings: 'none',
});

const withNotifications: EventSchedule = EventSchedule.fill({
  ...fromDatabase,
  notificationSettings: NotificationSettings.fill({
    notifyOnAnswerChange: true,
  }),
});

const withAnswerDeadline: EventSchedule = EventSchedule.fill({
  ...fromDatabase,
  answerDeadline: { year: 2026, month: 10, date: 31, hours: 23, minutes: 59 },
});

type Setup = Readonly<{
  store: EditEventSchedule;
  calls: readonly string[];
  browser: ReturnType<typeof createMemoryBrowser>;
  router: AppRouter;
  toasts: Readonly<{ count: number }>;
}>;

/** A toaster that only counts what it is asked to show. */
const fakeToaster = (onShow: () => number): Toaster =>
  ({
    show: () => `toast-${onShow()}`,
    dismiss: () => undefined,
    clear: () => undefined,
    getToasts: () => [],
    remove: () => undefined,
  }) as const;

const setup = (
  options?: Readonly<{ updateFails?: boolean; emailFails?: boolean }>,
): Setup => {
  const browser = createMemoryBrowser('https://example.com/event/abc/edit/');

  const [fireAuthUser$] = createState<EventScheduleSettingUser | undefined>({
    uid: 'u1',
    displayName: 'alice',
    email: 'alice@example.com',
  });

  const mut_calls: string[] = [];

  const mut_toasts = { count: 0 };

  const router = createAppRouter(browser);

  const store = createEditEventScheduleStore({
    api: {
      event: {
        update: (eventId, ev) => {
          mut_calls.push(`update ${eventId} ${ev.title} ${ev.author.name}`);

          return Promise.resolve(
            options?.updateFails === true
              ? Result.err('denied')
              : Result.ok(undefined),
          );
        },
        setAuthorsEmail: (eventId, email) => {
          mut_calls.push(`setAuthorsEmail ${eventId} ${email}`);

          return Promise.resolve(
            options?.emailFails === true
              ? Result.err('denied')
              : Result.ok(undefined),
          );
        },
      },
    },
    fireAuthUser$,
    answers: {
      refetchAnswersAfterWrite: () => {
        mut_calls.push('refetch answers');
      },
    },
    eventSchedule: {
      refetchEventScheduleAfterWrite: () => {
        mut_calls.push('refetch event');
      },
    },
    router,
    toast: Promise.resolve(
      fakeToaster(() => {
        mut_toasts.count += 1;

        return mut_toasts.count;
      }),
    ),
  });

  return {
    store,
    calls: mut_calls,
    browser,
    router,
    toasts: mut_toasts,
  } as const;
};

const settle = async (): Promise<void> => {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, 10);
  });
};
