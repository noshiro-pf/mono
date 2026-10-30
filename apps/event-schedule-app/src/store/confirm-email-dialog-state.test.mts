import type { Toaster } from '@blueprintjs/core';
import { EventSchedule, NotificationSettings } from 'event-schedule-app-shared';
import { createState } from 'synstate';
import { createMemoryBrowser } from 'tiny-router-observable';
import { Result } from 'ts-data-forge';
import {
  createConfirmEmailDialogStore,
  type ConfirmEmailDialog,
} from './confirm-email-dialog-state.mjs';
import { createAppRouter } from './router-store.mjs';

describe(createConfirmEmailDialogStore, () => {
  test('is open for an event with notifications until the email is confirmed', async () => {
    const { store, verified } = setup('ok');

    assert.isTrue(store.isOpen$.getSnapshot().value);

    store.inputEmailHandler('bob@example.com');

    store.enterClickHandler();

    await settle();

    assert.isFalse(store.isOpen$.getSnapshot().value);

    assert.deepStrictEqual(verified, ['bob@example.com']);
  });

  test('is never open for an event without notifications', () => {
    const { store } = setup('ok', { notifications: false });

    assert.isFalse(store.isOpen$.getSnapshot().value);
  });

  test('stays open with an error for an email that does not match', async () => {
    const { store, verified } = setup('ng');

    store.inputEmailHandler('someone@example.com');

    store.enterClickHandler();

    await settle();

    assert.isTrue(store.isOpen$.getSnapshot().value);

    assert.isDefined(store.state.getSnapshot().value.formState.email.error);

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

    assert.isTrue(store.isOpen$.getSnapshot().value);

    assert.strictEqual(toasts.count, 1);
  });

  test('asks again after the edit page is left and opened again', async () => {
    const { store, browser } = setup('ok');

    store.inputEmailHandler('bob@example.com');

    store.enterClickHandler();

    await settle();

    browser.history.back();

    browser.history.forward();

    assert.isTrue(store.isOpen$.getSnapshot().value);
  });

  test('cancel goes back to where the edit page was opened from', () => {
    const { store, browser } = setup('ok');

    store.cancelClickHandler();

    assert.strictEqual(browser.url().pathname, '/event/abc/');
  });
});

type Setup = Readonly<{
  store: ConfirmEmailDialog;
  browser: ReturnType<typeof createMemoryBrowser>;
  verified: readonly string[];
  toasts: Readonly<{ count: number }>;
}>;

const setup = (
  answer: 'fails' | 'ng' | 'ok',
  options?: Readonly<{ notifications?: boolean }>,
): Setup => {
  const browser = createMemoryBrowser('https://example.com/event/abc/');

  const router = createAppRouter(browser);

  router.push('/event/abc/edit/');

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
      setEmailVerified: (email) => {
        if (email !== undefined) {
          mut_verified.push(email);
        }

        return email;
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
    verified: mut_verified,
    toasts: mut_toasts,
  } as const;
};

/** A toaster that only counts what it is asked to show. */
const fakeToaster = (onShow: () => number): Toaster =>
  ({
    show: () => `toast-${onShow()}`,
    dismiss: () => undefined,
    clear: () => undefined,
    getToasts: () => [],
  }) as const;

const settle = async (): Promise<void> => {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, 10);
  });
};
