import { Answer, EventSchedule } from 'event-schedule-app-shared';
import { createState } from 'synstate';
import { createMemoryBrowser } from 'synstate-router';
import { Optional, Result } from 'ts-data-forge';
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
      Optional.unwrap(store.answerBeingEditedSectionState$.getSnapshot()),
      'creating',
    );

    assert.strictEqual(
      Optional.unwrap(store.answerBeingEdited$.getSnapshot()).user.name,
      'alice',
    );
  });

  test('an answer of another signed-in user is not opened for editing', () => {
    const { store } = setup({ uid: 'u1', displayName: 'alice' });

    store.onAnswerClick(answerOf('u2', 'bob'));

    assert.strictEqual(
      Optional.unwrap(store.answerBeingEditedSectionState$.getSnapshot()),
      'hidden',
    );
  });

  test('one’s own answer, or one of nobody signed in, is opened for editing', () => {
    const { store } = setup({ uid: 'u1', displayName: 'alice' });

    const own = answerOf('u1', 'alice');

    store.onAnswerClick(own);

    assert.strictEqual(
      Optional.unwrap(store.answerBeingEditedSectionState$.getSnapshot()),
      'editing',
    );

    assert.deepStrictEqual(
      Optional.unwrap(store.answerBeingEdited$.getSnapshot()),
      own,
    );

    store.onAnswerClick(answerOf(null, 'carol'));

    assert.strictEqual(
      Optional.unwrap(store.answerBeingEdited$.getSnapshot()).user.name,
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
      Optional.unwrap(store.answerBeingEditedSectionState$.getSnapshot()),
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

  test('deleting removes the answer being edited, and says so', async () => {
    const { store, calls, toasts } = setup(undefined);

    store.onAnswerClick(answerOf(null, 'carol'));

    await store.onDeleteAnswerClick();

    assert.deepStrictEqual(calls, ['delete abc a-carol', 'refetch']);

    await settle();

    assert.deepStrictEqual(toasts.intents, ['success']);
  });

  describe('a write the database refuses', () => {
    test('an add keeps the section and what was typed, and says it failed', async () => {
      const { store, calls, toasts } = setup(undefined, true);

      store.onAddAnswerButtonClick();

      store.onUserNameChange(Answer.fill({ user: { name: 'dave' } }).user.name);

      store.onCommentChange('a long comment the user typed');

      await store.onSubmitAnswerClickPromise();

      assert.strictEqual(
        Optional.unwrap(store.answerBeingEditedSectionState$.getSnapshot()),
        'creating',
      );

      const kept = Optional.unwrap(store.answerBeingEdited$.getSnapshot());

      assert.strictEqual(kept.user.name, 'dave');

      assert.strictEqual(kept.comment, 'a long comment the user typed');

      assert.isFalse(
        Optional.unwrap(store.submitButtonIsLoading$.getSnapshot()),
      );

      // The event is read again, so that a deadline passed meanwhile shows.
      assert.deepStrictEqual(calls, ['add abc dave', 'refetch event']);

      await settle();

      assert.deepStrictEqual(toasts.intents, ['danger']);
    });

    test('an update keeps the answer being edited', async () => {
      const { store, toasts } = setup(undefined, true);

      store.onAnswerClick(answerOf(null, 'carol'));

      store.onCommentChange('see you');

      await store.onSubmitAnswerClickPromise();

      assert.strictEqual(
        Optional.unwrap(store.answerBeingEditedSectionState$.getSnapshot()),
        'editing',
      );

      assert.strictEqual(
        Optional.unwrap(store.answerBeingEdited$.getSnapshot()).comment,
        'see you',
      );

      await settle();

      assert.deepStrictEqual(toasts.intents, ['danger']);
    });

    test('answering later says it failed', async () => {
      const { store, toasts } = setup(
        { uid: 'u1', displayName: 'alice' },
        true,
      );

      await store.onSubmitEmptyAnswerClick();

      await settle();

      assert.deepStrictEqual(toasts.intents, ['danger']);
    });

    test('a delete keeps the section and says it failed', async () => {
      const { store, toasts } = setup(undefined, true);

      store.onAnswerClick(answerOf(null, 'carol'));

      await store.onDeleteAnswerClick();

      assert.strictEqual(
        Optional.unwrap(store.answerBeingEditedSectionState$.getSnapshot()),
        'editing',
      );

      await settle();

      assert.deepStrictEqual(toasts.intents, ['danger']);
    });
  });

  test('answering later adds an empty answer in the signed-in user’s name', async () => {
    const { store, calls } = setup({ uid: 'u1', displayName: 'alice' });

    await store.onSubmitEmptyAnswerClick();

    assert.deepStrictEqual(calls, ['add abc alice', 'refetch']);
  });

  test('while an answer is being saved, the section stays as drawn and takes nothing else', async () => {
    const { store, calls } = setup(undefined);

    store.onAnswerClick(answerOf(null, 'carol'));

    const saving = store.onSubmitAnswerClickPromise();

    assert.isTrue(Optional.unwrap(store.submitButtonIsLoading$.getSnapshot()));

    assert.strictEqual(
      Optional.unwrap(store.answerBeingEditedSectionState$.getSnapshot()),
      'editing',
    );

    // Opened now, this answer would be cleared when the save ends.
    store.onAnswerClick(answerOf(null, 'erin'));

    store.onCancelEditingAnswer();

    await store.onSubmitAnswerClickPromise();

    await saving;

    assert.deepStrictEqual(calls, ['update abc a-carol ', 'refetch']);

    assert.isFalse(Optional.unwrap(store.submitButtonIsLoading$.getSnapshot()));

    assert.strictEqual(
      Optional.unwrap(store.answerBeingEditedSectionState$.getSnapshot()),
      'hidden',
    );
  });

  test('a submit with the section hidden saves nothing and leaves no spinner', async () => {
    const { store, calls } = setup(undefined);

    await store.onSubmitAnswerClickPromise();

    assert.deepStrictEqual(calls, []);

    assert.isFalse(Optional.unwrap(store.submitButtonIsLoading$.getSnapshot()));
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
      Optional.unwrap(store.answerBeingEdited$.getSnapshot()).user.id,
      'u1',
    );

    store.toggleProtectedSection();

    assert.isNull(
      Optional.unwrap(store.answerBeingEdited$.getSnapshot()).user.id,
    );
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
  toasts: Readonly<{ count: number; intents: readonly string[] }>;
}>;

/** A toaster that only records the intent of what it is asked to show. */
const fakeToaster = (onShow: (intent: string) => number): Toaster =>
  ({
    show: (props) => `toast-${onShow(props.intent ?? 'none')}`,
    dismiss: () => undefined,
    clear: () => undefined,
    getToasts: () => [],
    remove: () => undefined,
  }) as const;

const setup = (
  user: SignedInUser | undefined,
  /** Whether the database refuses every write, as its rules do past the deadline. */
  refuse = false,
): Setup => {
  const browser = createMemoryBrowser('https://example.com/event/abc/');

  const mut_calls: string[] = [];

  const mut_toasts: { count: number; intents: string[] } = {
    count: 0,
    intents: [],
  };

  const answered = <A,>(ok: A): Promise<Result<A, string>> =>
    Promise.resolve(refuse ? Result.err('denied') : Result.ok(ok));

  const [answers$] = createState<readonly Answer[] | undefined>([]);

  const [eventSchedule$] = createState<EventSchedule | undefined>(
    EventSchedule.fill({ title: 'event' }),
  );

  const store = createAnswerPageStore({
    api: {
      answers: {
        add: (eventId, answer) => {
          mut_calls.push(`add ${eventId} ${answer.user.name}`);

          return answered('new-id');
        },
        update: (eventId, answerId, answer) => {
          mut_calls.push(`update ${eventId} ${answerId} ${answer.comment}`);

          return answered(undefined);
        },
        delete: (eventId, answerId) => {
          mut_calls.push(`delete ${eventId} ${answerId}`);

          return answered(undefined);
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
    eventSchedule: {
      refetchEventScheduleAfterWrite: () => {
        mut_calls.push('refetch event');
      },
    },
    toast: Promise.resolve(
      fakeToaster((intent) => {
        mut_toasts.count += 1;

        mut_toasts.intents.push(intent);

        return mut_toasts.count;
      }),
    ),
  });

  return { store, browser, calls: mut_calls, toasts: mut_toasts } as const;
};

const answerOf = (userId: string | null, userName: string): Answer =>
  Answer.fill({ id: `a-${userName}`, user: { id: userId, name: userName } });

const settle = async (): Promise<void> => {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, 10);
  });
};
