import {
  asMilestoneId,
  asTaskId,
  createMilestone,
  createTask,
  type Dependency,
  type DomainState,
} from '../domain/index.mjs';
import { arcEdges } from './arc-edges.mjs';

const DAY_MS = 86_400_000;

const onTask = (
  id: string,
  type: 'finish-to-start' | 'start-to-start' = 'finish-to-start',
  lagMs: number = 0,
): Dependency =>
  ({ from: { kind: 'task', id: asTaskId(id) }, type, lagMs }) as const;

const onMilestone = (id: string): Dependency =>
  ({ from: { kind: 'milestone', id: asMilestoneId(id) }, lagMs: 0 }) as const;

const task = (
  id: string,
  dependencies: readonly Dependency[] = [],
): DomainState['tasks'][number] =>
  createTask({
    id: asTaskId(id),
    title: id.toUpperCase(),
    now: 0,
    dependencies,
  });

const milestone = (
  id: string,
  dependencies: readonly Dependency[] = [],
): DomainState['milestones'][number] =>
  createMilestone({
    id: asMilestoneId(id),
    title: id.toUpperCase(),
    now: 0,
    dependencies,
  });

/** `from>to`, and `*` for a derived edge. */
const pairs = (state: DomainState): readonly string[] =>
  arcEdges(state).map(
    ({ from, to, derived }) => `${from}>${to}${derived ? '*' : ''}`,
  );

describe(arcEdges, () => {
  test('keeps a dependency between two tasks, with its label', () => {
    const edges = arcEdges({
      tasks: [
        task('a'),
        task('b', [onTask('a', 'start-to-start', 3 * DAY_MS)]),
      ],
      milestones: [],
    });

    assert.deepStrictEqual(
      edges.map(({ from, to, derived, label, via, ariaLabel }) => ({
        from,
        to,
        derived,
        label,
        via,
        ariaLabel,
      })),
      [
        {
          from: 'task:a',
          to: 'task:b',
          derived: false,
          label: 'SS +3日',
          via: [],
          ariaLabel: 'A → B（開始後・+3日）',
        },
      ],
    );
  });

  test('names a finish-to-start dependency without a lag plainly', () => {
    const [edge] = arcEdges({
      tasks: [task('a'), task('b', [onTask('a')])],
      milestones: [],
    });

    assert.strictEqual(edge?.label, '');

    assert.strictEqual(edge?.ariaLabel, 'A → B（完了後）');
  });

  test('derives an edge through a milestone, without a label', () => {
    const edges = arcEdges({
      tasks: [task('a'), task('c', [onMilestone('m')])],
      milestones: [milestone('m', [onTask('a')])],
    });

    assert.deepStrictEqual(
      edges.map(({ from, to, derived, label, via, ariaLabel }) => ({
        from,
        to,
        derived,
        label,
        via,
        ariaLabel,
      })),
      [
        {
          from: 'task:a',
          to: 'task:c',
          derived: true,
          label: '',
          via: ['milestone:m'],
          ariaLabel: 'A → C（マイルストーン M 経由）',
        },
      ],
    );
  });

  test('follows a chain of milestones, naming them from the source', () => {
    const [edge] = arcEdges({
      tasks: [task('a'), task('c', [onMilestone('m1')])],
      milestones: [
        milestone('m1', [onMilestone('m2')]),
        milestone('m2', [onMilestone('m3')]),
        milestone('m3', [onTask('a')]),
      ],
    });

    assert.deepStrictEqual(edge?.via, [
      'milestone:m3',
      'milestone:m2',
      'milestone:m1',
    ]);

    assert.strictEqual(
      edge?.ariaLabel,
      'A → C（マイルストーン M3 → M2 → M1 経由）',
    );
  });

  test('reaches every task behind a milestone that depends on a task and a milestone', () => {
    assert.deepStrictEqual(
      pairs({
        tasks: [task('a'), task('b'), task('c', [onMilestone('m1')])],
        milestones: [
          milestone('m1', [onTask('a'), onMilestone('m2')]),
          milestone('m2', [onTask('b')]),
        ],
      }),
      ['task:a>task:c*', 'task:b>task:c*'],
    );
  });

  test('stops at the first task: what a task behind it waits for is its own', () => {
    assert.deepStrictEqual(
      pairs({
        tasks: [
          task('a'),
          task('b', [onTask('a')]),
          task('c', [onMilestone('m')]),
        ],
        milestones: [milestone('m', [onTask('b')])],
      }),
      ['task:a>task:b', 'task:b>task:c*'],
    );
  });

  test('derives nothing a direct dependency already draws', () => {
    assert.deepStrictEqual(
      pairs({
        tasks: [task('a'), task('c', [onTask('a'), onMilestone('m')])],
        milestones: [milestone('m', [onTask('a')])],
      }),
      ['task:a>task:c'],
    );
  });

  test('derives each pair once, however many paths lead there', () => {
    const edges = arcEdges({
      tasks: [task('a'), task('c', [onMilestone('m1'), onMilestone('m2')])],
      milestones: [
        milestone('m1', [onTask('a'), onMilestone('m2')]),
        milestone('m2', [onTask('a')]),
      ],
    });

    assert.deepStrictEqual(
      edges.map(({ from, to, via }) => ({ from, to, via })),
      [{ from: 'task:a', to: 'task:c', via: ['milestone:m1'] }],
    );
  });

  test('ignores milestones no task waits for, and dependencies on nothing', () => {
    assert.deepStrictEqual(
      pairs({
        tasks: [task('a'), task('b', [onTask('gone'), onMilestone('gone')])],
        milestones: [milestone('m', [onTask('a')])],
      }),
      [],
    );
  });

  test('terminates on a cycle of milestones, which the editor never saves', () => {
    assert.deepStrictEqual(
      pairs({
        tasks: [task('a'), task('c', [onMilestone('m1')])],
        milestones: [
          milestone('m1', [onMilestone('m2')]),
          milestone('m2', [onMilestone('m1'), onTask('a')]),
        ],
      }),
      ['task:a>task:c*'],
    );
  });

  test('draws no edge from a task to itself, even through a cycle', () => {
    assert.deepStrictEqual(
      pairs({
        tasks: [task('a', [onMilestone('m')])],
        milestones: [milestone('m', [onTask('a')])],
      }),
      [],
    );
  });

  test('has ids unique across direct and derived edges', () => {
    const edges = arcEdges({
      tasks: [
        task('a'),
        task('b', [onTask('a')]),
        task('c', [onMilestone('m')]),
      ],
      milestones: [milestone('m', [onTask('a'), onTask('b')])],
    });

    const ids = edges.map(({ id }) => id);

    const unique = new Set(ids);

    assert.strictEqual(unique.size, ids.length);

    assert.strictEqual(ids.length, 3);
  });
});
