import { createState } from 'synstate';
import {
  asMilestoneId,
  asTaskId,
  type GraphNodeId,
  type NodeRef,
} from '../domain/index.mjs';
import { createBulkDeleteStore } from './bulk-delete-store.mjs';

const a: GraphNodeId = 'task:a';

const m: GraphNodeId = 'milestone:m';

const setup = (): Readonly<{
  store: ReturnType<typeof createBulkDeleteStore>;
  setSelected: (ids: readonly GraphNodeId[]) => void;
  deleted: readonly (readonly NodeRef[])[];
  confirming: () => boolean;
}> => {
  const [selected, setSelected] = createState<readonly GraphNodeId[]>([a, m]);

  const mut_deleted: (readonly NodeRef[])[] = [];

  const store = createBulkDeleteStore({
    selected,
    deleteNodes: (refs) => {
      mut_deleted.push(refs);
    },
  });

  return {
    store,
    setSelected,
    deleted: mut_deleted,
    confirming: () => store.confirming.getSnapshot().value,
  };
};

describe(createBulkDeleteStore, () => {
  test('asks first, and deletes every node selected once confirmed', () => {
    const { store, deleted, confirming } = setup();

    assert.isFalse(confirming());

    store.request();

    assert.isTrue(confirming());

    assert.deepStrictEqual(deleted, []);

    store.confirm();

    assert.deepStrictEqual(deleted, [
      [
        { kind: 'task', id: asTaskId('a') },
        { kind: 'milestone', id: asMilestoneId('m') },
      ],
    ]);

    assert.isFalse(confirming());
  });

  test('deletes nothing when cancelled', () => {
    const { store, deleted, confirming } = setup();

    store.request();

    store.cancel();

    assert.isFalse(confirming());

    store.confirm();

    assert.deepStrictEqual(deleted, []);
  });

  test('stops asking when the selection changes, so as never to delete what was not asked about', () => {
    const { store, setSelected, deleted, confirming } = setup();

    store.request();

    setSelected([a]);

    assert.isFalse(confirming());

    store.confirm();

    assert.deepStrictEqual(deleted, []);

    // Selecting the same nodes again does not bring the question back.
    setSelected([a, m]);

    assert.isFalse(confirming());
  });

  test('asks nothing while none is selected', () => {
    const { store, setSelected, deleted, confirming } = setup();

    setSelected([]);

    store.request();

    assert.isFalse(confirming());

    store.confirm();

    assert.deepStrictEqual(deleted, []);
  });
});
