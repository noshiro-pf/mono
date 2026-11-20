import { deletedUserWrites } from './deleted-user-writes.mjs';

describe(deletedUserWrites, () => {
  test('marks each authored event as made by a deleted account and drops its notification email', () => {
    assert.deepStrictEqual(
      deletedUserWrites({ eventIds: ['e1', 'e2'], answerPaths: [] }),
      [
        { type: 'set-user-id', path: 'events_v7/e1', field: 'author.id' },
        { type: 'delete', path: 'events_v7/e1/internal/values' },
        { type: 'set-user-id', path: 'events_v7/e2', field: 'author.id' },
        { type: 'delete', path: 'events_v7/e2/internal/values' },
      ],
    );
  });

  test('marks each answer', () => {
    assert.deepStrictEqual(
      deletedUserWrites({
        eventIds: [],
        answerPaths: ['events_v7/e1/answers/a1'],
      }),
      [
        {
          type: 'set-user-id',
          path: 'events_v7/e1/answers/a1',
          field: 'user.id',
        },
      ],
    );
  });
});
