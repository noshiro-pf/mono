/**
 * A project as one JSON file — its tasks, milestones and groups, and the
 * layout of its DAG — to keep, to move to another account, or to hand to
 * another tool.
 *
 * The records are written as they are stored in Firestore (`converters.mts`,
 * pruned to the documents' codecs as `api/firestore-io.mts` does) with their
 * ids beside them, and read back through the same converters: so
 * a file is checked as a document is, and a field this version does not know
 * is left out. A file is read whole or not at all: any record that is not
 * one, or that Firestore would refuse, or an id used twice refuses it,
 * saying what is wrong. A dependency on a node the file does not have, or a
 * cycle, does not: the app shows either as it is (never met, never
 * reached), and a project can hold them — so its own backup must load.
 */

import { Arr, hasKey, isRecord, isString, Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import type { DagLayout } from '../dag/index.mjs';
import type { DomainState, Group } from '../domain/index.mjs';
import {
  DagLayoutDocCodec,
  dagLayoutFromDoc,
  dagLayoutToDoc,
  GroupDocCodec,
  groupFromDoc,
  groupToDoc,
  MilestoneDocCodec,
  milestoneFromDoc,
  milestoneToDoc,
  TaskDocCodec,
  taskFromDoc,
  taskToDoc,
} from './converters.mjs';
import { docBytes, utf8Bytes } from './doc-bytes.mjs';

/** `snapshot` as a project file, exported at `exportedAt`. */
export const projectFileText = (
  snapshot: ProjectSnapshot,
  exportedAt: number,
): string =>
  JSON.stringify(
    {
      format: PROJECT_FILE_FORMAT,
      version: PROJECT_FILE_VERSION,
      exportedAt,
      tasks: snapshot.state.tasks.map((task) => ({
        id: task.id,
        ...TaskDocCodec.prune(taskToDoc(task)),
      })),
      milestones: snapshot.state.milestones.map((milestone) => ({
        id: milestone.id,
        ...MilestoneDocCodec.prune(milestoneToDoc(milestone)),
      })),
      groups: snapshot.groups.map((group) => ({
        id: group.id,
        ...GroupDocCodec.prune(groupToDoc(group)),
      })),
      dagLayout:
        snapshot.dagLayout === undefined
          ? null
          : DagLayoutDocCodec.prune(
              dagLayoutToDoc(snapshot.dagLayout, exportedAt),
            ),
    },
    undefined,
    2,
  );

/**
 * The project `text` holds, or what is wrong with it: in Japanese, naming
 * the record, then the codecs' own messages of which field is wrong.
 */
export const parseProjectFile = (
  text: string,
): Result<ProjectSnapshot, readonly string[]> => {
  const json = Result.fromThrowable(() => JSON.parse(text) as unknown);

  if (Result.isErr(json)) {
    return Result.err(['JSON として読めません。']);
  }

  const head = ProjectFileHeadCodec.validate(json.value);

  if (Result.isErr(head)) {
    return Result.err(
      headErrors(json.value, t.validationErrorsToMessages(head.value)),
    );
  }

  const tasks = readRecords(
    head.value.tasks,
    taskFromDoc,
    (task) => TaskDocCodec.prune(taskToDoc(task)),
    'タスク',
  );

  const milestones = readRecords(
    head.value.milestones,
    milestoneFromDoc,
    (milestone) => MilestoneDocCodec.prune(milestoneToDoc(milestone)),
    'マイルストーン',
  );

  const groups = readRecords(
    head.value.groups,
    groupFromDoc,
    (group) => GroupDocCodec.prune(groupToDoc(group)),
    'グループ',
  );

  const dagLayout: Result<DagLayout | undefined, readonly string[]> =
    head.value.dagLayout === null
      ? Result.ok(undefined)
      : readLayout(head.value.dagLayout);

  if (
    Result.isErr(tasks) ||
    Result.isErr(milestones) ||
    Result.isErr(groups) ||
    Result.isErr(dagLayout)
  ) {
    return Result.err([
      ...errorsOf(tasks),
      ...errorsOf(milestones),
      ...errorsOf(groups),
      ...errorsOf(dagLayout),
    ]);
  }

  const duplicates = [
    ...duplicateIds(tasks.value, 'タスク'),
    ...duplicateIds(milestones.value, 'マイルストーン'),
    ...duplicateIds(groups.value, 'グループ'),
  ] as const;

  return Arr.isNonEmpty(duplicates)
    ? Result.err(duplicates)
    : Result.ok({
        state: { tasks: tasks.value, milestones: milestones.value },
        groups: groups.value,
        dagLayout: dagLayout.value,
      });
};

/** What a project file holds, and what an import replaces a project with. */
export type ProjectSnapshot = Readonly<{
  state: DomainState;
  groups: readonly Group[];
  /** `undefined` for a project whose DAG has not been arranged. */
  dagLayout: DagLayout | undefined;
}>;

export const PROJECT_FILE_FORMAT = 'task-manager-project';

/** Raised when what a file holds changes in a way an older reader cannot read. */
export const PROJECT_FILE_VERSION = 1;

/**
 * What every project file has, the records left to their own converters:
 * they are read one by one, so that each wrong one is named.
 */
const ProjectFileHeadCodec = t.record({
  format: t.literal(PROJECT_FILE_FORMAT),
  version: t.literal(PROJECT_FILE_VERSION),
  exportedAt: t.number(),
  tasks: t.array(t.unknown()),
  milestones: t.array(t.unknown()),
  groups: t.array(t.unknown()),
  dagLayout: t.unknown(),
});

/**
 * The largest record a file may hold, as Firestore counts it
 * (`doc-bytes.mts`): under its 1 MiB of a document, which also counts the
 * document's name.
 */
const MAX_RECORD_BYTES = 1_046_000;

/**
 * The most positions the layout document can hold: each is three of the
 * 20,000 fields Firestore takes a document (`<id>`, `x`, `y`), and four of
 * its 40,000 index entries.
 */
const MAX_LAYOUT_POSITIONS = 6600;

/**
 * Why `file` is not a project file this version can read, given what
 * {@link ProjectFileHeadCodec} said of it.
 */
const headErrors = (
  file: unknown,
  messages: readonly string[],
): readonly string[] =>
  !isRecord(file) ||
  !hasKey(file, 'format') ||
  file.format !== PROJECT_FILE_FORMAT
    ? ([
        'このアプリが書き出したプロジェクトのファイルではありません。',
      ] as const)
    : hasKey(file, 'version') && file.version !== PROJECT_FILE_VERSION
      ? ([
          `形式の版 ${JSON.stringify(file.version)} は読めません（読めるのは ${PROJECT_FILE_VERSION}）。`,
        ] as const)
      : Arr.toUnshifted('プロジェクトのファイルの形が正しくありません。')(
          messages,
        );

/**
 * Whether Firestore takes `name` as a map key's: not `__…__`, and short
 * enough for the field path `positions.<name>.x` to fit in 1500 bytes.
 */
const isUsableFieldName = (name: string): boolean =>
  !(name.length >= 4 && name.startsWith('__') && name.endsWith('__')) &&
  utf8Bytes(name) <= 1400;

/**
 * Whether Firestore takes `id` as a document's: not empty, no `/`, not `.`
 * or `..`, not `__…__` — and short enough to be a key of the layout too,
 * where it is `task:<id>`.
 */
const isUsableId = (id: string): boolean =>
  id !== '' &&
  !id.includes('/') &&
  id !== '.' &&
  id !== '..' &&
  isUsableFieldName(id) &&
  utf8Bytes(id) <= 1300;

/**
 * Each of `records` read by `fromDoc` with the id beside it, or a message
 * for each that is not one, or that `toDoc` makes too large to store,
 * naming it by its place: `タスク 3 件目: …`.
 */
const readRecords = <A,>(
  records: readonly unknown[],
  fromDoc: (id: string, data: unknown) => Result<A, readonly string[]>,
  toDoc: (value: A) => unknown,
  kind: string,
): Result<readonly A[], readonly string[]> => {
  const results = records.map((record, index) => {
    const place = `${kind} ${index + 1} 件目` as const;

    if (!isRecord(record) || !hasKey(record, 'id') || !isString(record.id)) {
      return Result.err([`${place}: id がありません。`]);
    }

    const { id } = record;

    if (!isUsableId(id)) {
      return Result.err([
        `${place}: id「${id}」は使えません（空、「/」を含むもの、「.」「..」、「__」で始まり「__」で終わるもの、1300 バイトを超えるものは使えません）。`,
      ]);
    }

    const read = fromDoc(id, record);

    if (Result.isErr(read)) {
      return Result.err(read.value.map((message) => `${place}: ${message}`));
    }

    // As it would be written, without what this version leaves out.
    return docBytes(toDoc(read.value)) > MAX_RECORD_BYTES
      ? Result.err([`${place}: 大きすぎます（1 MB まで）。`])
      : read;
  });

  const errors = results.flatMap((result) =>
    Result.isErr(result) ? result.value : [],
  );

  return Arr.isNonEmpty(errors)
    ? Result.err(errors)
    : Result.ok(
        Arr.generate(function* () {
          for (const result of results) {
            if (Result.isOk(result)) {
              yield result.value;
            }
          }
        }),
      );
};

/**
 * The layout `data` holds, unless Firestore would refuse one of its keys,
 * or its size.
 */
const readLayout = (data: unknown): Result<DagLayout, readonly string[]> => {
  const layout = dagLayoutFromDoc(data);

  if (Result.isErr(layout)) {
    return Result.err(layout.value.map((error) => `DAG の配置: ${error}`));
  }

  const unusable = [
    ...layout.value.positions.keys(),
    ...layout.value.groupPositions.keys(),
  ].filter((key) => !isUsableFieldName(key));

  if (
    layout.value.positions.size + layout.value.groupPositions.size >
    MAX_LAYOUT_POSITIONS
  ) {
    return Result.err([
      `DAG の配置: 位置が多すぎます（${MAX_LAYOUT_POSITIONS} まで）。`,
    ]);
  }

  if (Arr.isNonEmpty(unusable)) {
    return Result.err(
      unusable.map((key) => `DAG の配置: 「${key}」の位置は保存できません。`),
    );
  }

  return docBytes(DagLayoutDocCodec.prune(dagLayoutToDoc(layout.value, 0))) >
    MAX_RECORD_BYTES
    ? Result.err(['DAG の配置: 大きすぎます（1 MB まで）。'])
    : layout;
};

const errorsOf = (
  result: Result<unknown, readonly string[]>,
): readonly string[] => (Result.isErr(result) ? result.value : ([] as const));

/** A message for each id used more than once among `records`. */
const duplicateIds = (
  records: readonly Readonly<{ id: string }>[],
  kind: string,
): readonly string[] => {
  const byId = Map.groupBy(records, ({ id }) => id);

  return Arr.generate(function* () {
    for (const [id, same] of byId) {
      if (same.length > 1) {
        yield `${kind}の id「${id}」が ${same.length} 回あります。`;
      }
    }
  });
};
