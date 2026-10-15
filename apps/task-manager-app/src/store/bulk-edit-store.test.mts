import {
  asGroupId,
  asMilestoneId,
  asTaskId,
  NO_NODE_EDIT,
  type NodeEdit,
  type NodeRef,
} from '../domain/index.mjs';
import { createBulkEditStore } from './bulk-edit-store.mjs';

const refs: readonly NodeRef[] = [
  { kind: 'task', id: asTaskId('a') },
  { kind: 'milestone', id: asMilestoneId('m') },
] as const;

const setup = (): Readonly<{
  store: ReturnType<typeof createBulkEditStore>;
  edits: readonly (readonly [readonly NodeRef[], NodeEdit])[];
}> => {
  const mut_edits: (readonly [readonly NodeRef[], NodeEdit])[] = [];

  const store = createBulkEditStore({
    editNodes: (edited, edit) => {
      mut_edits.push([edited, edit]);
    },
  });

  return { store, edits: mut_edits };
};

describe(createBulkEditStore, () => {
  test('opens with every field left as it is, and saving that changes nothing', () => {
    const { store, edits } = setup();

    store.open(refs);

    assert.deepStrictEqual(store.editor.getSnapshot().value, {
      type: 'open',
      refs,
      progress: undefined,
      addLabels: '',
      removeLabels: [],
      group: undefined,
    });

    store.save();

    assert.deepStrictEqual(edits, [[refs, NO_NODE_EDIT]]);

    assert.strictEqual(store.editor.getSnapshot().value.type, 'closed');
  });

  test('saves what was chosen, the labels to add parsed from the field', () => {
    const { store, edits } = setup();

    const g = asGroupId('g');

    store.open(refs);

    store.setProgress('done');

    store.setAddLabels('api、 urgent,api');

    store.toggleRemoveLabel('ui');

    store.toggleRemoveLabel('docs');

    store.toggleRemoveLabel('ui');

    store.setGroup({ to: g });

    store.save();

    assert.deepStrictEqual(edits, [
      [
        refs,
        {
          progress: 'done',
          addLabels: ['api', 'urgent'],
          removeLabels: ['docs'],
          group: { to: g },
        },
      ],
    ]);
  });

  test('writes nothing when closed without saving', () => {
    const { store, edits } = setup();

    store.open(refs);

    store.setProgress('done');

    store.close();

    store.save();

    assert.deepStrictEqual(edits, []);
  });
});
