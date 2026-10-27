import { createState } from 'synstate';
import {
  asMilestoneId,
  asTaskId,
  createMilestone,
  createTask,
  type DomainState,
  type GraphNodeId,
} from '../domain/index.mjs';
import { createDagSelectionStore } from './dag-selection-store.mjs';

const state: DomainState = {
  tasks: [
    createTask({ id: asTaskId('a'), title: 'A', now: 0 }),
    createTask({ id: asTaskId('b'), title: 'B', now: 0 }),
  ],
  milestones: [createMilestone({ id: asMilestoneId('m'), title: 'M', now: 0 })],
} as const;

const setup = (): Readonly<{
  store: ReturnType<typeof createDagSelectionStore>;
  selected: () => readonly GraphNodeId[];
  setState: (next: DomainState) => void;
  setHidden: (next: ReadonlySet<GraphNodeId>) => void;
  setActive: (next: boolean) => void;
}> => {
  const [stateObservable, setState] = createState<DomainState>(state);

  const [hidden, setHidden] = createState<ReadonlySet<GraphNodeId>>(
    new Set<GraphNodeId>(),
  );

  const [active, setActive] = createState(true);

  const store = createDagSelectionStore({
    state: stateObservable,
    hidden,
    active,
  });

  store.start();

  return {
    store,
    selected: () => store.selected.getSnapshot().value,
    setState,
    setHidden,
    setActive,
  };
};

describe(createDagSelectionStore, () => {
  test('selects what it is given, in place of what was selected, each once', () => {
    const { store, selected } = setup();

    assert.deepStrictEqual(selected(), []);

    store.select(['task:a', 'milestone:m', 'task:a']);

    assert.deepStrictEqual(selected(), ['task:a', 'milestone:m']);

    store.select(['task:b']);

    assert.deepStrictEqual(selected(), ['task:b']);

    store.clear();

    assert.deepStrictEqual(selected(), []);
  });

  test('leaves out the nodes that are gone or hidden', () => {
    const { store, selected, setState, setHidden } = setup();

    store.select(['task:a', 'task:b', 'milestone:m']);

    setHidden(new Set<GraphNodeId>(['milestone:m']));

    assert.deepStrictEqual(selected(), ['task:a', 'task:b']);

    setState({
      ...state,
      tasks: state.tasks.filter(({ id }) => id !== asTaskId('a')),
    });

    assert.deepStrictEqual(selected(), ['task:b']);

    // Shown again, it is selected again.
    setHidden(new Set<GraphNodeId>());

    assert.deepStrictEqual(selected(), ['task:b', 'milestone:m']);
  });

  test('is dropped when the DAG stops being drawn', () => {
    const { store, selected, setActive } = setup();

    store.select(['task:a']);

    setActive(false);

    assert.deepStrictEqual(selected(), []);

    setActive(true);

    assert.deepStrictEqual(selected(), []);
  });
});
