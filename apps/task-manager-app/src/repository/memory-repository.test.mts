import type { DagLayout } from '../dag/index.mjs';
import {
  asMilestoneId,
  asTaskId,
  createMilestone,
  createTask,
  removeNode,
  type DomainState,
} from '../domain/index.mjs';
import { createMemoryRepository } from './memory-repository.mjs';

const a = createTask({ id: asTaskId('a'), title: 'A', now: 0 });

const b = createTask({
  id: asTaskId('b'),
  title: 'B',
  now: 0,
  dependencies: [
    {
      from: { kind: 'task', id: asTaskId('a') },
      type: 'finish-to-start',
      lagMs: 0,
    },
  ],
});

const m = createMilestone({ id: asMilestoneId('m'), title: 'M', now: 0 });

const initial: DomainState = { tasks: [a, b], milestones: [m] } as const;

const record = (): Readonly<{
  states: readonly DomainState[];
  next: (state: DomainState) => void;
  error: (error: unknown) => void;
}> => {
  const mut_states: DomainState[] = [];

  return {
    states: mut_states,
    next: (state) => {
      mut_states.push(state);
    },
    error: () => {},
  };
};

describe(createMemoryRepository, () => {
  test('hands a subscriber the state at once', () => {
    const repository = createMemoryRepository(initial);

    const observer = record();

    repository.subscribe(observer);

    assert.deepStrictEqual(observer.states, [initial]);
  });

  test('replaces a task in place, and appends a new one', async () => {
    const repository = createMemoryRepository(initial);

    const observer = record();

    repository.subscribe(observer);

    await repository.putTask({ ...a, title: 'A2' });

    const c = createTask({ id: asTaskId('c'), title: 'C', now: 0 });

    await repository.putTask(c);

    assert.deepStrictEqual(observer.states.at(-1)?.tasks, [
      { ...a, title: 'A2' },
      b,
      c,
    ]);
  });

  test('puts a milestone', async () => {
    const repository = createMemoryRepository(initial);

    const observer = record();

    repository.subscribe(observer);

    await repository.putMilestone({ ...m, title: 'M2' });

    assert.deepStrictEqual(observer.states.at(-1)?.milestones, [
      { ...m, title: 'M2' },
    ]);
  });

  test('deletes a node and writes the cleanup in one change', async () => {
    const repository = createMemoryRepository(initial);

    const observer = record();

    repository.subscribe(observer);

    const ref = { kind: 'task', id: asTaskId('a') } as const;

    const removed = removeNode(initial, ref, 100);

    await repository.deleteNode(ref, removed);

    assert.strictEqual(observer.states.length, 2);

    assert.deepStrictEqual(observer.states.at(-1), removed.state);
  });

  test('stops handing changes to an unsubscribed observer', async () => {
    const repository = createMemoryRepository(initial);

    const observer = record();

    const unsubscribe = repository.subscribe(observer);

    unsubscribe();

    await repository.putMilestone({ ...m, title: 'M2' });

    assert.strictEqual(observer.states.length, 1);
  });
});

describe('the DAG layout of a memory repository', () => {
  const layout: DagLayout = {
    direction: 'down',
    positions: new Map([['task:a', { x: 1, y: 2 }]]),
  } as const;

  const recordLayouts = (): Readonly<{
    layouts: readonly (DagLayout | undefined)[];
    next: (value: DagLayout | undefined) => void;
    error: (error: unknown) => void;
  }> => {
    const mut_layouts: (DagLayout | undefined)[] = [];

    return {
      layouts: mut_layouts,
      next: (next) => {
        mut_layouts.push(next);
      },
      error: () => {},
    };
  };

  test('is none until one is put', () => {
    const repository = createMemoryRepository(initial);

    const observer = recordLayouts();

    repository.subscribeDagLayout(observer);

    assert.deepStrictEqual(observer.layouts, [undefined]);
  });

  test('starts from the one it is given', () => {
    const repository = createMemoryRepository(initial, layout);

    const observer = recordLayouts();

    repository.subscribeDagLayout(observer);

    assert.deepStrictEqual(observer.layouts, [layout]);
  });

  test('hands a layout put to the subscribers, and nothing after unsubscribing', async () => {
    const repository = createMemoryRepository(initial);

    const observer = recordLayouts();

    const unsubscribe = repository.subscribeDagLayout(observer);

    await repository.putDagLayout(layout, 100);

    assert.deepStrictEqual(observer.layouts, [undefined, layout]);

    unsubscribe();

    await repository.putDagLayout({ ...layout, direction: 'right' }, 200);

    assert.strictEqual(observer.layouts.length, 2);
  });

  test('keeps the layout apart from the tasks', async () => {
    const repository = createMemoryRepository(initial);

    const observer = record();

    repository.subscribe(observer);

    await repository.putDagLayout(layout, 100);

    assert.strictEqual(observer.states.length, 1);
  });
});
