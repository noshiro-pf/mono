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

/** `from>to` for every arc. */
const pairs = (state: DomainState): readonly string[] =>
  arcEdges(state).map(({ from, to }) => `${from}>${to}`);

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
      edges.map(({ from, to, label, ariaLabel }) => ({
        from,
        to,
        label,
        ariaLabel,
      })),
      [
        {
          from: 'task:a',
          to: 'task:b',
          label: 'SS +3日',
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

  test('draws the dependencies on and of milestones, as the DAG does', () => {
    assert.deepStrictEqual(
      pairs({
        tasks: [task('a'), task('c', [onMilestone('m1')])],
        milestones: [
          milestone('m1', [onTask('a'), onMilestone('m2')]),
          milestone('m2'),
        ],
      }),
      [
        'milestone:m1>task:c',
        'task:a>milestone:m1',
        'milestone:m2>milestone:m1',
      ],
    );
  });

  test('names a dependency on a milestone without a kind', () => {
    const [edge] = arcEdges({
      tasks: [task('c', [onMilestone('m')])],
      milestones: [milestone('m')],
    });

    assert.strictEqual(edge?.ariaLabel, 'M → C');
  });

  test('draws nothing for a dependency on a node not drawn', () => {
    assert.deepStrictEqual(
      pairs({
        tasks: [task('a'), task('b', [onTask('gone'), onMilestone('gone')])],
        milestones: [],
      }),
      [],
    );
  });

  test('has unique ids', () => {
    const edges = arcEdges({
      tasks: [
        task('a'),
        task('b', [onTask('a')]),
        task('c', [onMilestone('m'), onTask('a')]),
      ],
      milestones: [milestone('m', [onTask('a'), onTask('b')])],
    });

    const ids = edges.map(({ id }) => id);

    const unique = new Set(ids);

    assert.strictEqual(unique.size, ids.length);

    assert.strictEqual(ids.length, 5);
  });
});
