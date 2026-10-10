/**
 * Editing the dependencies of one node in its form: the rows that hold them
 * while the dialog is open, what each row amounts to (refused when it would
 * close a cycle), which nodes it can depend on, and how each is described.
 */

import { Arr, Num, Result } from 'ts-data-forge';
import type { DeepReadonly, StrictOmit } from 'ts-type-forge';
import {
  isGraphNodeId,
  isTaskDependency,
  listNodes,
  nodeId,
  wouldCreateCycle,
  type Dependency,
  type DependencyType,
  type DomainState,
  type GraphNodeId,
  type NodeRef,
} from '../domain/index.mjs';
import { dependencyTypeLabels, formatLag } from './format.mjs';
import { lagFromParts, lagToParts } from './lag.mjs';

/** The rows of `dependencies`, keyed by their position. */
export const rowsFromDependencies = (
  dependencies: readonly Dependency[],
): readonly DependencyRow[] =>
  dependencies.map((dependency, key) => {
    const { days, hours } = lagToParts(dependency.lagMs);

    return {
      key,
      source: nodeId(dependency.from),
      type: isTaskDependency(dependency) ? dependency.type : 'finish-to-start',
      lagDays: String(days),
      lagHours: String(hours),
    };
  });

/** `rows` with an empty row after them. */
export const appendEmptyRow = (
  rows: readonly DependencyRow[],
): readonly DependencyRow[] =>
  Arr.toPushed(rows, {
    key: rows.reduce((max, { key }) => Math.max(max, key + 1), 0),
    source: '',
    type: 'finish-to-start',
    lagDays: '0',
    lagHours: '0',
  });

export const updateRow = (
  rows: readonly DependencyRow[],
  key: number,
  patch: Partial<StrictOmit<DependencyRow, 'key'>>,
): readonly DependencyRow[] =>
  rows.map((row) => (row.key === key ? { ...row, ...patch } : row));

export const removeRow = (
  rows: readonly DependencyRow[],
  key: number,
): readonly DependencyRow[] => rows.filter((row) => row.key !== key);

/**
 * Each row of `dependent`'s dialog checked, in order. A row with no source is
 * empty and left out. Otherwise it is wrong when its source no longer
 * exists, when an earlier row has the same source (one edge per pair keeps
 * the graph readable), when the edge would close a cycle — which the
 * evaluator cannot resolve and which would leave everything on it blocked
 * for good — or when its lag is not a number of zero or more.
 *
 * The cycle check reads the stored state. Every edge the rows describe
 * points into `dependent`, so no path out of it runs through them.
 */
export const validateRows = (
  state: DomainState,
  dependent: NodeRef,
  rows: readonly DependencyRow[],
): readonly RowCheck[] => {
  const refs: ReadonlyMap<GraphNodeId, NodeRef> = new Map(
    listNodes(state).map(({ id, ref }) => [id, ref]),
  );

  return rows.map((row, index): RowCheck => {
    const { key, source } = row;

    if (source === '') {
      return { key, status: 'empty' };
    }

    const error = (message: string): RowCheck =>
      ({
        key,
        status: 'error',
        message,
      }) as const;

    const ref = refs.get(source);

    if (ref === undefined) {
      return error('依存先が見つかりません。外してください。');
    }

    if (rows.slice(0, index).some((earlier) => earlier.source === source)) {
      return error(`${nodeTitle(state, ref)} にはすでに依存しています。`);
    }

    if (wouldCreateCycle(state, dependent, ref)) {
      return error(
        nodeId(dependent) === source
          ? '自分自身には依存できません。'
          : `${nodeTitle(state, ref)} は ${nodeTitle(state, dependent)} に依存しているため、循環する依存になります。`,
      );
    }

    const lagMs = parseLag(row);

    if (Result.isErr(lagMs)) {
      return error(lagMs.value);
    }

    return {
      key,
      status: 'ok',
      dependency:
        ref.kind === 'task'
          ? { from: ref, type: row.type, lagMs: lagMs.value }
          : { from: ref, lagMs: lagMs.value },
    };
  });
};

/** The dependencies of the rows that are right; what the dialog evaluates. */
export const validDependencies = (
  checks: readonly RowCheck[],
): readonly Dependency[] =>
  checks.flatMap((check) => (check.status === 'ok' ? [check.dependency] : []));

/**
 * What saving the rows writes: their dependencies, or the rows that are
 * wrong (see {@link validateRows}).
 */
export const dependenciesFromRows = (
  state: DomainState,
  dependent: NodeRef,
  rows: readonly DependencyRow[],
): Result<readonly Dependency[], readonly RowError[]> => {
  const checks = validateRows(state, dependent, rows);

  const errors = checks.filter(
    (check): check is RowError => check.status === 'error',
  );

  return Arr.isNonEmpty(errors)
    ? Result.err(errors)
    : Result.ok(validDependencies(checks));
};

/** Every node but `dependent`, as the options of a `<select>`. */
export const dependencySourceOptions = (
  state: DomainState,
  dependent: NodeRef,
): readonly SourceOption[] => {
  const dependentId = nodeId(dependent);

  return listNodes(state)
    .filter(({ id }) => id !== dependentId)
    .map(({ id, ref }) => ({
      value: id,
      label: `${ref.kind === 'task' ? 'タスク' : 'マイルストーン'}: ${nodeTitle(state, ref)}`,
      ref,
    }));
};

/** `A の完了後 +2日`: what the dependency waits for. */
export const describeDependency = (
  state: DomainState,
  dependency: Dependency,
): string => {
  const waitsFor = isTaskDependency(dependency)
    ? dependencyTypeLabels[dependency.type]
    : '到達後';

  const lag = formatLag(dependency.lagMs);

  return `${nodeTitle(state, dependency.from)} の${waitsFor}${lag === '' ? '' : ` ${lag}`}`;
};

/**
 * The value of the source `<select>` as a node id, or `''` for anything
 * else — the placeholder, or a value that is not a node id.
 */
export const parseSourceValue = (value: string): GraphNodeId | '' =>
  isGraphNodeId(value) ? value : '';

/** The title of the node, or a placeholder for one that no longer exists. */
export const nodeTitle = (state: DomainState, ref: NodeRef): string =>
  ref.kind === 'task'
    ? (state.tasks.find(({ id }) => id === ref.id)?.title ??
      '（削除されたタスク）')
    : (state.milestones.find(({ id }) => id === ref.id)?.title ??
      '（削除されたマイルストーン）');

/** An empty part is zero. */
const parseLag = ({
  lagDays,
  lagHours,
}: DependencyRow): Result<number, string> => {
  const days = Num.safeParseFloat(lagDays.trim() === '' ? '0' : lagDays.trim());

  const hours = Num.safeParseFloat(
    lagHours.trim() === '' ? '0' : lagHours.trim(),
  );

  if (Result.isErr(days) || Result.isErr(hours)) {
    return Result.err('ずらす時間は数で入力してください。');
  }

  const lagMs = lagFromParts(days.value, hours.value);

  return lagMs < 0
    ? Result.err('ずらす時間は 0 以上にしてください。')
    : Result.ok(lagMs);
};

export type SourceOption = DeepReadonly<{
  value: GraphNodeId;
  label: string;
  ref: NodeRef;
}>;

/**
 * The dependencies of the node in its dialog are edited as rows, one per
 * dependency, each holding its fields the way the inputs give them back. A
 * row means nothing until it is saved, and what is typed into one is saved
 * without a separate step to add it.
 */
export type DependencyRow = DeepReadonly<{
  /** Stable for as long as the row exists; the key of its element. */
  key: number;
  /** Empty while nothing is chosen. */
  source: GraphNodeId | '';
  /** Read only when the source is a task. */
  type: DependencyType;
  lagDays: string;
  lagHours: string;
}>;

/** What one row amounts to: nothing yet, a dependency, or why it is wrong. */
export type RowCheck = DeepReadonly<
  | RowError
  | (
      | { key: number; status: 'empty' }
      | { key: number; status: 'ok'; dependency: Dependency }
    )
>;

export type RowError = DeepReadonly<{
  key: number;
  status: 'error';
  message: string;
}>;
