import { EventSchedule, NotificationSettings } from 'event-schedule-app-shared';
import { createState } from 'synstate';
import { createMemoryBrowser } from 'synstate-router';
import { Optional, Result } from 'ts-data-forge';
import { routes } from '../constants/index.mjs';
import {
  createConfirmEmailDialogStore,
  type ConfirmEmailDialog,
} from './confirm-email-dialog-state.mjs';
import { createEditEventScheduleStore } from './create-event-schedule-page/index.mjs';
import { createAppRouter, type AppRouter } from './router-store.mjs';

describe(createConfirmEmailDialogStore, () => {
  test('is open for an event with notifications until the email is confirmed', async () => {
    const { store, verified } = setup('ok');

    assert.isTrue(Optional.unwrap(store.isOpen$.getSnapshot()));

    store.inputEmailHandler('bob@example.com');

    store.enterClickHandler();

    await settle();

    assert.isFalse(Optional.unwrap(store.isOpen$.getSnapshot()));

    assert.deepStrictEqual(verified, ['abc:bob@example.com']);
  });

  test('is never open for an event without notifications', () => {
    const { store } = setup('ok', { notifications: false });

    assert.isFalse(Optional.unwrap(store.isOpen$.getSnapshot()));
  });

  test('stays open with an error for an email that does not match', async () => {
    const { store, verified } = setup('ng');

    store.inputEmailHandler('someone@example.com');

    store.enterClickHandler();

    await settle();

    assert.isTrue(Optional.unwrap(store.isOpen$.getSnapshot()));

    assert.isDefined(
      Optional.unwrap(store.state.getSnapshot()).formState.email.error,
    );

    assert.deepStrictEqual(verified, []);
  });

  test('says so when the check fails', async () => {
    const { store, toasts } = setup('fails');

    store.inputEmailHandler('bob@example.com');

    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    store.enterClickHandler();

    await settle();

    consoleError.mockRestore();

    assert.isTrue(Optional.unwrap(store.isOpen$.getSnapshot()));

    assert.strictEqual(toasts.count, 1);
  });

  test('asks again after the edit page is left and opened again', async () => {
    const { store, browser } = setup('ok');

    store.inputEmailHandler('bob@example.com');

    store.enterClickHandler();

    await settle();

    assert.isFalse(Optional.unwrap(store.isOpen$.getSnapshot()));

    browser.history.go(-1);

    await settle();

    browser.history.go(1);

    await settle();

    assert.isTrue(Optional.unwrap(store.isOpen$.getSnapshot()));
  });

  test('drops an answer that comes back after the edit page is left and opened again', async () => {
    const { store, router, verified } = setup('ok');

    store.inputEmailHandler('bob@example.com');

    store.enterClickHandler();

    // A link, not the history: a history move lands in a later task, after the
    // answer.
    router.push(routes.event.answer.href({ eventId: 'abc' }));

    router.push(routes.event.answer.edit.href({ eventId: 'abc' }));

    await settle();

    assert.deepStrictEqual(verified, []);

    assert.isTrue(Optional.unwrap(store.isOpen$.getSnapshot()));
  });

  test('drops an answer that comes back after another event’s edit page opened', async () => {
    const { store, router, verified } = setup('ok');

    store.inputEmailHandler('bob@example.com');

    store.enterClickHandler();

    router.push(routes.event.answer.edit.href({ eventId: 'xyz' }));

    await settle();

    assert.deepStrictEqual(verified, []);

    assert.isTrue(Optional.unwrap(store.isOpen$.getSnapshot()));

    assert.isFalse(
      Optional.unwrap(store.state.getSnapshot()).formState.isWaitingResponse,
    );
  });

  test('drops an answer that comes back after the edit page is left', async () => {
    const { store, router, verified, toasts } = setup('ok');

    store.inputEmailHandler('bob@example.com');

    store.enterClickHandler();

    router.push(routes.event.answer.href({ eventId: 'abc' }));

    await settle();

    assert.deepStrictEqual(verified, []);

    assert.strictEqual(toasts.count, 0);
  });

  test('cancel goes back to where the edit page was opened from', async () => {
    const { store, browser } = setup('ok');

    store.cancelClickHandler();

    await settle();

    assert.strictEqual(browser.url().pathname, '/event/abc/');
  });
});

type Setup = Readonly<{
  store: ConfirmEmailDialog;
  browser: ReturnType<typeof createMemoryBrowser>;
  router: AppRouter;
  verified: readonly string[];
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
  answer: 'fails' | 'ng' | 'ok',
  options?: Readonly<{ notifications?: boolean }>,
): Setup => {
  const browser = createMemoryBrowser('https://example.com/event/abc/');

  const router = createAppRouter(browser);

  router.push(routes.event.answer.edit.href({ eventId: 'abc' }));

  const [eventSchedule$] = createState<EventSchedule | undefined>(
    EventSchedule.fill({
      title: 'event',
      notificationSettings:
        options?.notifications === false
          ? 'none'
          : NotificationSettings.fill({ notifyOnAnswerChange: true }),
    }),
  );

  const mut_verified: string[] = [];

  // The edit page's store, which keeps the confirmed email.
  const editEventSchedule = createEditEventScheduleStore({
    api: {
      event: {
        update: () => Promise.resolve(Result.ok(undefined)),
        setAuthorsEmail: () => Promise.resolve(Result.ok(undefined)),
      },
    },
    fireAuthUser$: createState(undefined)[0],
    answers: { refetchAnswersAfterWrite: () => undefined },
    eventSchedule: { refetchEventScheduleAfterWrite: () => undefined },
    router,
    toast: Promise.resolve(fakeToaster(() => 0)),
  });

  const mut_toasts = { count: 0 };

  const store = createConfirmEmailDialogStore({
    api: {
      event: {
        verifyEmail: () =>
          Promise.resolve(
            answer === 'fails'
              ? Result.err({ type: 'others', message: 'offline' } as const)
              : Result.ok(answer),
          ),
      },
    },
    router,
    eventSchedule$,
    editEventSchedule: {
      emailVerified$: editEventSchedule.emailVerified$,
      setEmailVerified: (eventId, email) => {
        mut_verified.push(`${eventId}:${email}`);

        editEventSchedule.setEmailVerified(eventId, email);
      },
    },
    toast: Promise.resolve(
      fakeToaster(() => {
        mut_toasts.count += 1;

        return mut_toasts.count;
      }),
    ),
  });

  return {
    store,
    browser,
    router,
    verified: mut_verified,
    toasts: mut_toasts,
  } as const;
};

const settle = async (): Promise<void> => {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, 10);
  });
};
