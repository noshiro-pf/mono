import { createState } from 'synstate';
import { asGroupId, type Group, type GroupId } from '../domain/index.mjs';
import {
  createGroupEditorStore,
  type GroupEditorStore,
} from './group-editor-store.mjs';

const stored: Group = {
  id: asGroupId('g'),
  title: 'Backend',
  createdAt: 0,
  updatedAt: 0,
} as const;

const now = 10_000;

type Setup = Readonly<{
  store: GroupEditorStore;
  put: readonly Group[];
  deleted: readonly GroupId[];
}>;

const setup = (): Setup => {
  const [groups] = createState<readonly Group[]>([stored]);

  const mut_put: Group[] = [];

  const mut_deleted: GroupId[] = [];

  const store = createGroupEditorStore({
    groups,
    now: () => now,
    newId: () => 'new',
    putGroup: (group) => {
      mut_put.push(group);
    },
    deleteGroup: (id) => {
      mut_deleted.push(id);
    },
  });

  return { store, put: mut_put, deleted: mut_deleted };
};

describe(createGroupEditorStore, () => {
  test('creates a group with the title given', () => {
    const { store, put } = setup();

    store.create();

    store.setTitle('  Frontend ');

    store.save();

    assert.deepStrictEqual(put, [
      {
        id: asGroupId('new'),
        title: 'Frontend',
        createdAt: now,
        updatedAt: now,
      },
    ]);

    assert.deepStrictEqual(store.editor.getSnapshot().value, {
      type: 'closed',
    });
  });

  test('renames a stored group, keeping when it was made', () => {
    const { store, put } = setup();

    store.open(asGroupId('g'));

    assert.deepStrictEqual(store.editor.getSnapshot().value, {
      type: 'open',
      isNew: false,
      id: asGroupId('g'),
      title: 'Backend',
      error: undefined,
      confirmingDelete: false,
    });

    store.setTitle('API');

    store.save();

    assert.deepStrictEqual(put, [{ ...stored, title: 'API', updatedAt: now }]);
  });

  test('refuses an empty title, and says so', () => {
    const { store, put } = setup();

    store.create();

    store.setTitle(' '.repeat(3));

    store.save();

    assert.deepStrictEqual(put, []);

    const editor = store.editor.getSnapshot().value;

    assert.isTrue(editor.type === 'open');

    assert.strictEqual(editor.error, 'グループ名を入力してください。');
  });

  test('opens nothing for a group that is gone', () => {
    const { store } = setup();

    store.open(asGroupId('gone'));

    assert.deepStrictEqual(store.editor.getSnapshot().value, {
      type: 'closed',
    });
  });

  test('deletes a stored group once confirmed', () => {
    const { store, deleted } = setup();

    store.open(asGroupId('g'));

    store.requestDelete();

    store.confirmDelete();

    assert.deepStrictEqual(deleted, [asGroupId('g')]);

    assert.deepStrictEqual(store.editor.getSnapshot().value, {
      type: 'closed',
    });
  });

  test('deletes nothing for a group not stored yet', () => {
    const { store, deleted } = setup();

    store.create();

    store.confirmDelete();

    assert.deepStrictEqual(deleted, []);
  });
});
