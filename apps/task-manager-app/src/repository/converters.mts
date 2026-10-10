/**
 * The domain records as Firestore documents, and back.
 *
 * A document holds a record minus its `id`, which is the document id. A
 * missing value (`undefined` in the domain) is written as `null` — Firestore
 * rejects `undefined`, and an explicit `null` keeps every field present, so a
 * document says what it does not have rather than leaving it to be guessed.
 * A dependency on a milestone has no `type` field at all, as in the domain.
 * So the document codecs are the domain's (`domain/types.mts`) with the id
 * left out and `null` in place of `undefined`, and nothing else.
 *
 * Reading validates everything: a document is data somebody else may have
 * written, by hand or with another version of this app. Fields this version
 * does not know are ignored rather than rejected, so a newer version can add
 * some without breaking an older tab: the domain codec's `prune` drops them.
 *
 * Writing: the functions here only give a document its shape, and may
 * carry along whatever else the value they were made from has at run time
 * (the id included). What is written is pruned to the document's codec by
 * the only functions that write (`api/firestore-io.mts`).
 *
 * The DAG's layout (`projects/{projectId}/settings/dagLayout`) holds the
 * positions as a map from node id to point. A position of a node that no
 * longer exists is read like any other and left unused.
 */

import { Obj, Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import { DagDirectionCodec, type DagLayout } from '../dag/index.mjs';
import {
  FiniteNumberCodec,
  GraphNodeIdCodec,
  MilestoneCodec,
  MilestoneIdCodec,
  TaskCodec,
  TaskIdCodec,
  type Milestone,
  type Task,
} from '../domain/index.mjs';

export const taskToDoc = (task: Task): TaskDoc =>
  ({
    ...task,
    dueDate: task.dueDate ?? null,
    startedAt: task.startedAt ?? null,
    completedAt: task.completedAt ?? null,
    estimateHours: task.estimateHours ?? null,
  }) as const;

export const milestoneToDoc = (milestone: Milestone): MilestoneDoc =>
  ({
    ...milestone,
    date: milestone.date ?? null,
    checkedAt: milestone.checkedAt ?? null,
  }) as const;

/** The task stored as document `id`, or why it is not one. */
export const taskFromDoc = (
  id: string,
  data: unknown,
): Result<Task, readonly string[]> => {
  if (!TaskIdCodec.is(id)) {
    return Result.err(['empty document id']);
  }

  // Pruned to what a task is: the fields this version does not know go.
  return Result.map(validate(TaskDocCodec, data), (doc) =>
    TaskCodec.prune({
      ...doc,
      id,
      dueDate: doc.dueDate ?? undefined,
      startedAt: doc.startedAt ?? undefined,
      completedAt: doc.completedAt ?? undefined,
      estimateHours: doc.estimateHours ?? undefined,
    }),
  );
};

/** The milestone stored as document `id`, or why it is not one. */
export const milestoneFromDoc = (
  id: string,
  data: unknown,
): Result<Milestone, readonly string[]> => {
  if (!MilestoneIdCodec.is(id)) {
    return Result.err(['empty document id']);
  }

  return Result.map(validate(MilestoneDocCodec, data), (doc) =>
    MilestoneCodec.prune({
      ...doc,
      id,
      date: doc.date ?? undefined,
      checkedAt: doc.checkedAt ?? undefined,
    }),
  );
};

export const dagLayoutToDoc = (
  layout: DagLayout,
  updatedAt: number,
): DagLayoutDoc =>
  ({
    direction: layout.direction,
    positions: Object.fromEntries(layout.positions),
    updatedAt,
  }) as const;

/** The layout stored in `data`, or why it is not one. */
export const dagLayoutFromDoc = (
  data: unknown,
): Result<DagLayout, readonly string[]> =>
  Result.map(validate(DagLayoutDocCodec, data), (doc) => ({
    direction: doc.direction,
    positions: new Map(
      Object.entries(doc.positions).flatMap(([id, { x, y }]) =>
        GraphNodeIdCodec.is(id) ? [[id, { x, y }] as const] : [],
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

export type TaskDoc = t.TypeOf<typeof TaskDocCodec>;

export type MilestoneDoc = t.TypeOf<typeof MilestoneDocCodec>;

export type DagLayoutDoc = t.TypeOf<typeof DagLayoutDocCodec>;

export type ProjectDoc = t.TypeOf<typeof ProjectDocCodec>;

/** What is `undefined` in the domain is `null` in a document. */
const NullableFiniteNumberCodec = t.union([FiniteNumberCodec, t.nullType]);

/**
 * A task without its id, a missing value `null`. The dependencies are the
 * domain's as they are.
 */
export const TaskDocCodec = t.record(
  {
    ...Obj.omit(TaskCodec.shape, ['id']),
    dueDate: NullableFiniteNumberCodec,
    startedAt: NullableFiniteNumberCodec,
    completedAt: NullableFiniteNumberCodec,
    estimateHours: NullableFiniteNumberCodec,
  },
  { typeName: 'TaskDoc' },
);

/** A milestone without its id, a missing value `null`. */
export const MilestoneDocCodec = t.record(
  {
    ...Obj.omit(MilestoneCodec.shape, ['id']),
    date: NullableFiniteNumberCodec,
    checkedAt: NullableFiniteNumberCodec,
  },
  { typeName: 'MilestoneDoc' },
);

export const DagLayoutDocCodec = t.record(
  {
    direction: DagDirectionCodec,
    positions: t.keyValueRecord(
      GraphNodeIdCodec,
      t.record({ x: FiniteNumberCodec, y: FiniteNumberCodec }),
    ),
    updatedAt: FiniteNumberCodec,
  },
  { typeName: 'DagLayoutDoc' },
);

export const ProjectDocCodec = t.record(
  {
    name: t.string(),
    ownerUid: t.string(),
    memberUids: t.array(t.string()),
    createdAt: FiniteNumberCodec,
  },
  { typeName: 'ProjectDoc' },
);

const validate = <A,>(
  type: t.Type<A>,
  data: unknown,
): Result<A, readonly string[]> =>
  Result.mapErr(type.validate(data), (errors) =>
    t.validationErrorsToMessages(errors),
  );
