import type { Toaster } from '@blueprintjs/core';
import { Answer, EventSchedule } from 'event-schedule-app-shared';
import { createState } from 'synstate';
import { createMemoryBrowser } from 'tiny-router-observable';
import { Result } from 'ts-data-forge';
import { createAppRouter } from '../router-store.mjs';
import {
  createAnswerPageStore,
  type AnswerPage,
  type SignedInUser,
} from './answer-page-state.mjs';

describe(createAnswerPageStore, () => {
  test('adding an answer opens the section, with the signed-in user’s name', () => {
    const { store } = setup({ uid: 'u1', displayName: 'alice' });

    store.onAddAnswerButtonClick();

    assert.strictEqual(
      store.answerBeingEditedSectionState$.getSnapshot().value,
      'creating',
    );

    assert.strictEqual(
      store.answerBeingEdited$.getSnapshot().value.user.name,
      'alice',
    );
  });

  test('an answer of another signed-in user is not opened for editing', () => {
    const { store } = setup({ uid: 'u1', displayName: 'alice' });

    store.onAnswerClick(answerOf('u2', 'bob'));

    assert.strictEqual(
      store.answerBeingEditedSectionState$.getSnapshot().value,
      'hidden',
    );
  });

  test('one’s own answer, or one of nobody signed in, is opened for editing', () => {
    const { store } = setup({ uid: 'u1', displayName: 'alice' });

    const own = answerOf('u1', 'alice');

    store.onAnswerClick(own);

    assert.strictEqual(
      store.answerBeingEditedSectionState$.getSnapshot().value,
      'editing',
    );

    assert.deepStrictEqual(store.answerBeingEdited$.getSnapshot().value, own);

    store.onAnswerClick(answerOf(null, 'carol'));

    assert.strictEqual(
      store.answerBeingEdited$.getSnapshot().value.user.name,
      'carol',
    );
  });

  test('submitting a new answer adds it, reads the answers again and says so', async () => {
    const { store, calls, toasts } = setup(undefined);

    store.onAddAnswerButtonClick();

    store.onUserNameChange(Answer.fill({ user: { name: 'dave' } }).user.name);

    await store.onSubmitAnswerClickPromise();

    assert.deepStrictEqual(calls, ['add abc dave', 'refetch']);

    assert.strictEqual(
      store.answerBeingEditedSectionState$.getSnapshot().value,
      'hidden',
    );

    await settle();

    assert.strictEqual(toasts.count, 1);
  });

  test('submitting an edited answer updates it', async () => {
    const { store, calls } = setup(undefined);

    store.onAnswerClick(answerOf(null, 'carol'));

    store.onCommentChange('see you');

    await store.onSubmitAnswerClickPromise();

    assert.deepStrictEqual(calls, ['update abc a-carol see you', 'refetch']);
  });

  test('deleting removes the answer being edited', async () => {
    const { store, calls } = setup(undefined);

    store.onAnswerClick(answerOf(null, 'carol'));

    await store.onDeleteAnswerClick();

    assert.deepStrictEqual(calls, ['delete abc a-carol', 'refetch']);
  });

  test('answering later adds an empty answer in the signed-in user’s name', async () => {
    const { store, calls } = setup({ uid: 'u1', displayName: 'alice' });

    await store.onSubmitEmptyAnswerClick();

    assert.deepStrictEqual(calls, ['add abc alice', 'refetch']);
  });

  test('answering later does nothing while nobody is signed in', async () => {
    const { store, calls } = setup(undefined);

    await store.onSubmitEmptyAnswerClick();

    assert.deepStrictEqual(calls, []);
  });

  test('protecting the answer ties it to the signed-in user, and back', () => {
    const { store } = setup({ uid: 'u1', displayName: 'alice' });

    store.onAnswerClick(answerOf(null, 'alice'));

    store.toggleProtectedSection();

    assert.strictEqual(
      store.answerBeingEdited$.getSnapshot().value.user.id,
      'u1',
    );

    store.toggleProtectedSection();

    assert.isNull(store.answerBeingEdited$.getSnapshot().value.user.id);
  });

  test('the edit button goes to the event’s edit page', () => {
    const { store, browser } = setup(undefined);

    store.onEditButtonClick();

    assert.strictEqual(browser.url().pathname, '/event/abc/edit/');
  });
});

type Setup = Readonly<{
  store: AnswerPage;
  browser: ReturnType<typeof createMemoryBrowser>;
  calls: readonly string[];
  toasts: Readonly<{ count: number }>;
}>;

const setup = (user: SignedInUser | undefined): Setup => {
  const browser = createMemoryBrowser('https://example.com/event/abc/');

  const mut_calls: string[] = [];

  const mut_toasts = { count: 0 };

  const [answers$] = createState<readonly Answer[] | undefined>([]);

  const [eventSchedule$] = createState<EventSchedule | undefined>(
    EventSchedule.fill({ title: 'event' }),
  );

  const store = createAnswerPageStore({
    api: {
      answers: {
        add: (eventId, answer) => {
          mut_calls.push(`add ${eventId} ${answer.user.name}`);

          return Promise.resolve(Result.ok('new-id'));
        },
        update: (eventId, answerId, answer) => {
          mut_calls.push(`update ${eventId} ${answerId} ${answer.comment}`);

          return Promise.resolve(Result.ok(undefined));
        },
        delete: (eventId, answerId) => {
          mut_calls.push(`delete ${eventId} ${answerId}`);

          return Promise.resolve(Result.ok(undefined));
        },
      },
    },
    answers: {
      answers$,
      refetchAnswersAfterWrite: () => {
        mut_calls.push('refetch');
      },
    },
    auth: { getFireAuthUserSnapshot: () => user },
    router: createAppRouter(browser),
    eventSchedule$,
    toast: Promise.resolve(
      fakeToaster(() => {
        mut_toasts.count += 1;

        return mut_toasts.count;
      }),
    ),
  });

  return { store, browser, calls: mut_calls, toasts: mut_toasts } as const;
};

const answerOf = (userId: string | null, userName: string): Answer =>
  Answer.fill({ id: `a-${userName}`, user: { id: userId, name: userName } });

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
