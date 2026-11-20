import { Answer } from 'event-schedule-app-shared';
import { deletedUserId } from './deleted-user-writes.mjs';
import { isOnlyUserIdCleared } from './is-only-user-id-cleared.mjs';

describe(isOnlyUserIdCleared, () => {
  const before = Answer.fill({
    id: 'answer-1',
    user: { id: 'user-1', name: 'Alice' },
    comment: 'hello',
  });

  test('is true when only user.id became the deleted account id, as onUserDelete writes it', () => {
    assert.isTrue(
      isOnlyUserIdCleared(
        before,
        Answer.fill({ ...before, user: { ...before.user, id: deletedUserId } }),
      ),
    );
  });

  test('is true when only user.id became null, as onUserDelete wrote it before', () => {
    assert.isTrue(
      isOnlyUserIdCleared(
        before,
        Answer.fill({ ...before, user: { ...before.user, id: null } }),
      ),
    );
  });

  test('is false when something else changed too', () => {
    assert.isFalse(
      isOnlyUserIdCleared(
        before,
        Answer.fill({
          ...before,
          user: { ...before.user, id: null },
          comment: 'edited',
        }),
      ),
    );
  });

  test('is false for an edit that keeps user.id', () => {
    assert.isFalse(
      isOnlyUserIdCleared(
        before,
        Answer.fill({ ...before, comment: 'edited' }),
      ),
    );
  });

  test('is false when user.id was already null', () => {
    const anonymous = Answer.fill({
      ...before,
      user: { ...before.user, id: null },
    });

    assert.isFalse(
      isOnlyUserIdCleared(
        anonymous,
        Answer.fill({ ...anonymous, comment: 'x' }),
      ),
    );

    assert.isFalse(isOnlyUserIdCleared(anonymous, anonymous));
  });
});
