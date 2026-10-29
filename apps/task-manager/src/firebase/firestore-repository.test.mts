import { initializeApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';
import { batchWrites, commitInBatches } from '../api/index.mjs';
import type { Point } from '../dag/index.mjs';
import {
  asGroupId,
  asMilestoneId,
  asTaskId,
  createMilestone,
  createTask,
  type GraphNodeId,
  type Group,
  type GroupId,
  type Task,
} from '../domain/index.mjs';
import type { ProjectSnapshot } from '../repository/index.mjs';
import { createFirestoreRepository } from './firestore-repository.mjs';

// Nothing here reaches a server: what each call of `commitInBatches` asks
// is recorded, a call to a line.
vi.mock(import('../api/index.mjs'), async (importOriginal) => ({
  ...(await importOriginal()),
  commitInBatches: vi.fn(),
}));

const firestore = initializeFirestore(
  initializeApp(
    { projectId: 'demo-task-manager-app' },
    'firestore-repository-test',
  ),
  {},
);

const task = (id: string): Task =>
  createTask({ id: asTaskId(id), title: id, now: 0 });

const group = (id: string): Group =>
  ({ id: asGroupId(id), title: id, createdAt: 0, updatedAt: 0 }) as const;

/** The project before: as the subscriptions handed it on. */
const previous: ProjectSnapshot = {
  state: {
    tasks: [task('kept'), task('gone')],
    milestones: [
      createMilestone({ id: asMilestoneId('m-gone'), title: 'M', now: 0 }),
    ],
  },
  groups: [group('g-kept')],
  dagLayout: undefined,
} as const;

/**
 * Every write asked, in order, as `set <path>` or `delete <path>`, each
 * call's writes apart.
 */
const recordWrites = (): readonly (readonly string[])[] => {
  const mut_calls: string[][] = [];

  vi.mocked(commitInBatches).mockImplementation((_, write) => {
    mut_calls.push(
      batchWrites(write).map((op) => `${op.type} ${op.ref.path}` as const),
    );

    return Promise.resolve();
  });

  return mut_calls;
};

describe('replacing the project in Firestore', () => {
  test('writes the new records, then deletes those only the old one has', async () => {
    const calls = recordWrites();

    await createFirestoreRepository(firestore, 'p').replaceProject(
      {
        state: {
          tasks: [task('kept'), task('new')],
          milestones: [
            createMilestone({ id: asMilestoneId('m-new'), title: 'M', now: 0 }),
          ],
        },
        groups: [group('g-kept')],
        dagLayout: undefined,
      },
      previous,
      5,
    );

    assert.deepStrictEqual(calls, [
      [
        'set projects/p/tasks/kept',
        'set projects/p/tasks/new',
        'set projects/p/milestones/m-new',
        'set projects/p/groups/g-kept',
      ],
      ['delete projects/p/tasks/gone', 'delete projects/p/milestones/m-gone'],
    ]);
  });

  test('deletes nothing when what is written fails', async () => {
    const calls = recordWrites();

    vi.mocked(commitInBatches).mockRejectedValueOnce(new Error('quota'));

    await expect(
      createFirestoreRepository(firestore, 'p').replaceProject(
        {
          state: { tasks: [], milestones: [] },
          groups: [],
          dagLayout: undefined,
        },
        previous,
        5,
      ),
    ).rejects.toThrow('quota');

    assert.deepStrictEqual(calls, []);
  });

  test('deletes the layout only when the old project had one', async () => {
    const calls = recordWrites();

    await createFirestoreRepository(firestore, 'p').replaceProject(
      previous,
      {
        ...previous,
        dagLayout: {
          direction: 'right',
          positions: new Map<GraphNodeId, Point>(),
          groupPositions: new Map<GroupId, Point>(),
        },
      },
      5,
    );

    assert.deepStrictEqual(calls[1], ['delete projects/p/settings/dagLayout']);
  });

  test('writes the layout when the new project has one', async () => {
    const calls = recordWrites();

    await createFirestoreRepository(firestore, 'p').replaceProject(
      {
        state: { tasks: [], milestones: [] },
        groups: [],
        dagLayout: {
          direction: 'right',
          positions: new Map<GraphNodeId, Point>(),
          groupPositions: new Map<GroupId, Point>(),
        },
      },
      previous,
      5,
    );

    assert.deepStrictEqual(calls[0], ['set projects/p/settings/dagLayout']);

    assert.notInclude(calls[1] ?? [], 'delete projects/p/settings/dagLayout');
  });
});
