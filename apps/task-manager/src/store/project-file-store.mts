/**
 * 「書き出す」 and 「読み込む」 of the whole project as one file
 * (`repository/project-file.mts`).
 *
 * Reading a file replaces the project with it, keeping the file's ids and
 * dates, in two steps: `openFile` reads it and asks — or shows why it cannot
 * be read — and `confirm` first exports the project as it stands, as a
 * backup, then replaces it. What replacing writes may not fit one batch,
 * so a failure part-way through can leave the project part replaced; the
 * error then names the backup that restores it. Firestore confirms the
 * writes only once the server has them, which offline is never, so the
 * dialog can be closed while they are sent; they go on.
 *
 * Neither runs until the whole project has loaded — its groups and layout
 * as well as its nodes: before that, what is exported would be short, and
 * an import would not delete what it has not seen. What it has not seen,
 * a document that could not be read, it leaves where it is.
 */

import { createState, type InitializedObservable } from 'synstate';
import { Result } from 'ts-data-forge';
import type { DeepReadonly } from 'ts-type-forge';
import type { DagLayout } from '../dag/index.mjs';
import type { DomainState, Group } from '../domain/index.mjs';
import {
  parseProjectFile,
  projectFileText,
  type ProjectSnapshot,
} from '../repository/index.mjs';
import { toFileStamp } from '../view-model/index.mjs';
import type { ProjectLoad } from './data-store.mjs';

export type ProjectFileDeps = Readonly<{
  state: InitializedObservable<DomainState>;
  groups: InitializedObservable<readonly Group[]>;
  dagLayout: InitializedObservable<DagLayout | undefined>;
  /** How far the whole project has loaded (`DataStore['projectLoad']`). */
  load: InitializedObservable<ProjectLoad>;
  now: () => number;
  /** Names the files by the wall clock of this zone; the browser's if none. */
  timeZone: string | undefined;
  /** Hands the reader a file to save; throws if it cannot. */
  download: (fileName: string, text: string) => void;
  /** Replaces `previous`, the project as it stands, with `next`. */
  replaceProject: (
    next: ProjectSnapshot,
    previous: ProjectSnapshot,
  ) => Promise<void>;
  /** Tells the reader; `error` is the cause, for the console. */
  reportError: (message: string, error?: unknown) => void;
}>;

export type ProjectFileStore = Readonly<{
  importState: InitializedObservable<ProjectImport>;
  /** Hands the reader the project as a file. */
  exportProject: () => void;
  /** Reads the file `fileName` holding `text`, and asks to import it. */
  openFile: (fileName: string, text: string) => void;
  /** Exports a backup, then replaces the project with the file asked about. */
  confirm: () => void;
  /** Closes the dialog; writes already started go on. */
  close: () => void;
  /**
   * Starts following the project's loading: when it starts over — signing
   * out, or in as somebody else — what was asked about it is dropped.
   * Returns what stops it.
   */
  start: () => () => void;
}>;

export type ProjectImport = DeepReadonly<
  | { type: 'idle' }
  | {
      type: 'confirming';
      fileName: string;
      snapshot: ProjectSnapshot;
      /** Why the last 「置き換える」 did nothing, shown in the dialog. */
      problem: string | undefined;
    }
  | { type: 'refused'; fileName: string; errors: string[] }
  | { type: 'importing' }
>;

export const createProjectFileStore = (
  deps: ProjectFileDeps,
): ProjectFileStore => {
  const [importState, setImportState, { getSnapshot }] =
    createState<ProjectImport>({ type: 'idle' });

  // The import whose writes are still being sent, if any: another one then
  // would delete what this one writes, or the other way round.
  const mut_pending: { current: Promise<void> | undefined } = {
    current: undefined,
  };

  /** The project as it stands, or why it cannot be had yet. */
  const current = (): Result<ProjectSnapshot, string> => {
    switch (deps.load.getSnapshot().value) {
      case 'loading':
        return Result.err('まだ読み込み中です。少し待ってからもう一度どうぞ。');

      case 'failed':
        return Result.err(
          'プロジェクトの一部を読み込めなかったため、プロジェクト全体を扱えません。ページを読み込み直してください。',
        );

      case 'loaded':
        return Result.ok({
          state: deps.state.getSnapshot().value,
          groups: deps.groups.getSnapshot().value,
          dagLayout: deps.dagLayout.getSnapshot().value,
        });
    }
  };

  /**
   * Hands the reader `snapshot` as a file named after `prefix`: its name,
   * or why the browser could not make it.
   */
  const download = (
    snapshot: ProjectSnapshot,
    prefix: string,
  ): Result<string, string> => {
    const now = deps.now();

    const fileName =
      `${prefix}-${toFileStamp(now, deps.timeZone)}.json` as const;

    try {
      deps.download(fileName, projectFileText(snapshot, now));
    } catch (error: unknown) {
      console.error(error);

      return Result.err('ファイルを書き出せませんでした。');
    }

    return Result.ok(fileName);
  };

  return {
    importState,
    exportProject: () => {
      const exported =
        mut_pending.current === undefined
          ? Result.flatMap(current(), (snapshot) =>
              download(snapshot, 'task-manager'),
            )
          : Result.err(
              '読み込みの書き込みがまだ終わっていません。終わってから書き出してください。',
            );

      if (Result.isErr(exported)) {
        deps.reportError(exported.value);
      }
    },
    openFile: (fileName, text) => {
      const parsed = parseProjectFile(text);

      setImportState(
        Result.isOk(parsed)
          ? {
              type: 'confirming',
              fileName,
              snapshot: parsed.value,
              problem: undefined,
            }
          : { type: 'refused', fileName, errors: parsed.value },
      );
    },
    confirm: () => {
      const asked = getSnapshot();

      if (asked.type !== 'confirming') {
        return;
      }

      if (mut_pending.current !== undefined) {
        setImportState({
          ...asked,
          problem:
            '前の読み込みの書き込みがまだ終わっていません。終わってからもう一度どうぞ。',
        });

        return;
      }

      const previous = current();

      // Nothing is replaced without a backup.
      const backup = Result.flatMap(previous, (snapshot) =>
        download(snapshot, 'task-manager-backup'),
      );

      if (Result.isErr(previous) || Result.isErr(backup)) {
        setImportState({
          ...asked,
          problem: Result.isErr(previous) ? previous.value : backup.value,
        });

        return;
      }

      // A new object each time, so that only this import's end closes it.
      const importing: ProjectImport = { type: 'importing' } as const;

      setImportState(importing);

      const pending = deps
        .replaceProject(asked.snapshot, previous.value)
        .catch((error: unknown) => {
          deps.reportError(
            `「${asked.fileName}」の読み込みの途中で失敗しました。一部だけ書き換わっているかもしれません。直前に書き出した「${backup.value}」を読み込めば元に戻せます。`,
            error,
          );
        })
        .finally(() => {
          if (mut_pending.current === pending) {
            mut_pending.current = undefined;
          }

          if (getSnapshot() === importing) {
            setImportState({ type: 'idle' });
          }
        });

      mut_pending.current = pending;
    },
    close: () => {
      setImportState({ type: 'idle' });
    },
    start: () => {
      const mut_last: { load: ProjectLoad } = {
        load: deps.load.getSnapshot().value,
      };

      const subscription = deps.load.subscribe((load) => {
        const startsOver = load === 'loading' && mut_last.load !== 'loading';

        mut_last.load = load;

        if (!startsOver) {
          return;
        }

        // A sign-out stops the writes of the session it ends, whether or
        // not their promise ever settles.
        mut_pending.current = undefined;

        setImportState({ type: 'idle' });
      });

      return () => {
        subscription.unsubscribe();
      };
    },
  };
};
