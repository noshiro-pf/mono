/**
 * The domain records as Firestore documents, and back.
 *
 * A document holds a record minus its `id`, which is the document id. A
 * missing value (`undefined` in the domain) is written as `null` — Firestore
 * rejects `undefined`, and an explicit `null` keeps every field present, so a
 * document says what it does not have rather than leaving it to be guessed.
 * A dependency on a milestone has no `type` field at all, as in the domain.
 *
 * Reading validates everything: a document is data somebody else may have
 * written, by hand or with another version of this app. Fields this version
 * does not know are ignored rather than rejected, so a newer version can add
 * some without breaking an older tab.
 *
 * The DAG's layout (`projects/{projectId}/settings/dagLayout`) holds the
 * positions as a map from node id to point. A position of a node that no
 * longer exists is read like any other and left unused.
 */

import { Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import type { RelaxedExtract } from 'ts-type-forge';
import { dagDirections, type DagLayout } from '../dag/index.mjs';
import {
  asMilestoneId,
  asTaskId,
  dependencyTypes,
  isGraphNodeId,
  isTaskDependency,
  priorities,
  progresses,
  type Dependency,
  type Milestone,
  type Task,
} from '../domain/index.mjs';

export const taskToDoc = (task: Task): TaskDoc =>
  ({
    title: task.title,
    description: task.description,
    progress: task.progress,
    priority: task.priority,
    dueDate: task.dueDate ?? null,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    startedAt: task.startedAt ?? null,
    completedAt: task.completedAt ?? null,
    labels: task.labels,
    estimateHours: task.estimateHours ?? null,
    assignees: task.assignees,
    reviewers: task.reviewers,
    dependencies: task.dependencies.map(dependencyToDoc),
  }) as const;

export const milestoneToDoc = (milestone: Milestone): MilestoneDoc =>
  ({
    title: milestone.title,
    description: milestone.description,
    createdAt: milestone.createdAt,
    updatedAt: milestone.updatedAt,
    date: milestone.date ?? null,
    requiresManualCheck: milestone.requiresManualCheck,
    checkedAt: milestone.checkedAt ?? null,
    dependencies: milestone.dependencies.map(dependencyToDoc),
  }) as const;

/** The task stored as document `id`, or why it is not one. */
export const taskFromDoc = (
  id: string,
  data: unknown,
): Result<Task, readonly string[]> => {
  if (id === '') {
    return Result.err(['empty document id']);
  }

  return Result.map(validate(TaskDocType, data), (doc) => ({
    id: asTaskId(id),
    title: doc.title,
    description: doc.description,
    progress: doc.progress,
    priority: doc.priority,
    dueDate: doc.dueDate ?? undefined,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    startedAt: doc.startedAt ?? undefined,
    completedAt: doc.completedAt ?? undefined,
    labels: doc.labels,
    estimateHours: doc.estimateHours ?? undefined,
    assignees: doc.assignees,
    reviewers: doc.reviewers,
    dependencies: doc.dependencies.map(dependencyFromDoc),
  }));
};

/** The milestone stored as document `id`, or why it is not one. */
export const milestoneFromDoc = (
  id: string,
  data: unknown,
): Result<Milestone, readonly string[]> => {
  if (id === '') {
    return Result.err(['empty document id']);
  }

  return Result.map(validate(MilestoneDocType, data), (doc) => ({
    id: asMilestoneId(id),
    title: doc.title,
    description: doc.description,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    date: doc.date ?? undefined,
    requiresManualCheck: doc.requiresManualCheck,
    checkedAt: doc.checkedAt ?? undefined,
    dependencies: doc.dependencies.map(dependencyFromDoc),
  }));
};

export const dagLayoutToDoc = (
  layout: DagLayout,
  updatedAt: number,
): DagLayoutDoc =>
  ({
    direction: layout.direction,
    positions: Object.fromEntries(
      Array.from(layout.positions, ([id, { x, y }]) => [id, { x, y }]),
    ),
    updatedAt,
  }) as const;

/** The layout stored in `data`, or why it is not one. */
export const dagLayoutFromDoc = (
  data: unknown,
): Result<DagLayout, readonly string[]> =>
  Result.map(validate(DagLayoutDocType, data), (doc) => ({
    direction: doc.direction,
    positions: new Map(
      Object.entries(doc.positions).flatMap(([id, { x, y }]) =>
        isGraphNodeId(id) ? [[id, { x, y }] as const] : [],
      ),
    ),
  }));

/**
 * The project every user gets on first sign-in, stored under their uid. The
 * shape leaves room for shared projects later: membership is a list.
 */
export const personalProjectDoc = (uid: string, now: number): ProjectDoc =>
  ({
    name: 'マイプロジェクト',
    ownerUid: uid,
    memberUids: [uid],
    createdAt: now,
  }) as const;

export type DependencyDoc = t.TypeOf<typeof DependencyDocType>;

export type TaskDoc = t.TypeOf<typeof TaskDocType>;

export type MilestoneDoc = t.TypeOf<typeof MilestoneDocType>;

export type DagLayoutDoc = t.TypeOf<typeof DagLayoutDocType>;

export type ProjectDoc = Readonly<{
  name: string;
  ownerUid: string;
  memberUids: readonly string[];
  createdAt: number;
}>;

const finiteNumber = t.refine({
  baseType: t.number(),
  is: (n: number): n is number => Number.isFinite(n),
  defaultValue: 0,
  typeName: 'finite number',
});

const nullableNumber = t.union([finiteNumber, t.nullType]);

const nonEmptyString = t.refine({
  baseType: t.string(),
  is: (s: string): s is string => s !== '',
  defaultValue: '-',
  typeName: 'non-empty string',
});

const DependencyDocType = t.union([
  t.record({
    from: t.record({ kind: t.literal('task'), id: nonEmptyString }),
    type: t.enumType(dependencyTypes),
    lagMs: finiteNumber,
  }),
  t.record({
    from: t.record({ kind: t.literal('milestone'), id: nonEmptyString }),
    lagMs: finiteNumber,
  }),
]);

const TaskDocType = t.record({
  title: t.string(),
  description: t.string(),
  progress: t.enumType(progresses),
  priority: t.enumType(priorities),
  dueDate: nullableNumber,
  createdAt: finiteNumber,
  updatedAt: finiteNumber,
  startedAt: nullableNumber,
  completedAt: nullableNumber,
  labels: t.array(t.string()),
  estimateHours: nullableNumber,
  assignees: t.array(t.string()),
  reviewers: t.array(t.string()),
  dependencies: t.array(DependencyDocType),
});

const MilestoneDocType = t.record({
  title: t.string(),
  description: t.string(),
  createdAt: finiteNumber,
  updatedAt: finiteNumber,
  date: nullableNumber,
  requiresManualCheck: t.boolean(),
  checkedAt: nullableNumber,
  dependencies: t.array(DependencyDocType),
});

const graphNodeIdString = t.refine({
  baseType: t.string(),
  is: isGraphNodeId,
  defaultValue: 'task:-',
  typeName: 'node id',
});

const DagLayoutDocType = t.record({
  direction: t.enumType(dagDirections),
  positions: t.keyValueRecord(
    graphNodeIdString,
    t.record({ x: finiteNumber, y: finiteNumber }),
  ),
  updatedAt: finiteNumber,
});

const validate = <A,>(
  type: t.Type<A>,
  data: unknown,
): Result<A, readonly string[]> =>
  Result.mapErr(type.validate(data), (errors) =>
    t.validationErrorsToMessages(errors),
  );

const dependencyToDoc = (dependency: Dependency): DependencyDoc =>
  isTaskDependency(dependency)
    ? ({
        from: { kind: 'task', id: dependency.from.id },
        type: dependency.type,
        lagMs: dependency.lagMs,
      } as const)
    : ({
        from: { kind: 'milestone', id: dependency.from.id },
        lagMs: dependency.lagMs,
      } as const);

const dependencyFromDoc = (doc: DependencyDoc): Dependency =>
  isTaskDependencyDoc(doc)
    ? ({
        from: { kind: 'task', id: asTaskId(doc.from.id) },
        type: doc.type,
        lagMs: doc.lagMs,
      } as const)
    : ({
        from: { kind: 'milestone', id: asMilestoneId(doc.from.id) },
        lagMs: doc.lagMs,
      } as const);

/**
 * Narrows on `from.kind`, which TypeScript does not do through a nested
 * discriminant. The milestone member of the union has no `type`, and a
 * document that says `task` without one fails validation, so the `kind`
 * decides.
 */
const isTaskDependencyDoc = (doc: DependencyDoc): doc is TaskDependencyDoc =>
  doc.from.kind === 'task';

type TaskDependencyDoc = RelaxedExtract<
  DependencyDoc,
  Readonly<{ type: unknown }>
>;
