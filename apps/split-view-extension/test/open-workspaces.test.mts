import { describeOpenedWorkspaces } from '../src/index.mjs';

describe('describeOpenedWorkspaces', () => {
  test('says what was opened', () => {
    assert.deepStrictEqual(
      describeOpenedWorkspaces({ opened: 1, alreadyOpen: 0 }),
      'Opened one split view in a tab of its own.',
    );

    assert.deepStrictEqual(
      describeOpenedWorkspaces({ opened: 3, alreadyOpen: 0 }),
      'Opened 3 split views in tabs of their own.',
    );
  });

  test('and what it left alone, which is why nothing seemed to happen', () => {
    assert.deepStrictEqual(
      describeOpenedWorkspaces({ opened: 2, alreadyOpen: 1 }),
      'Opened 2 split views in tabs of their own. One was already open.',
    );

    assert.deepStrictEqual(
      describeOpenedWorkspaces({ opened: 1, alreadyOpen: 4 }),
      'Opened one split view in a tab of its own. 4 were already open.',
    );
  });

  test('and says so when it opened nothing at all', () => {
    assert.deepStrictEqual(
      describeOpenedWorkspaces({ opened: 0, alreadyOpen: 2 }),
      'Every saved split view is already open in a tab.',
    );

    assert.deepStrictEqual(
      describeOpenedWorkspaces({ opened: 0, alreadyOpen: 0 }),
      'There is no saved split view to open.',
    );
  });
});
