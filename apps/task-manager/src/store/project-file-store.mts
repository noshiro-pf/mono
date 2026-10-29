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

import { createState, map, type InitializedObservable } from 'synstate';
import { Result } from 'ts-data-forge';
import type { DeepReadonly } from 'ts-type-forge';
import type { DagLayout } from '../dag/index.mjs';
import type { DomainState, Group } from '../domain/index.mjs';
import { m } from '../i18n/index.mjs';
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
  /** Whether an import's writes are still being sent, the dialog closed or not. */
  importing: InitializedObservable<boolean>;
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

  // The import whose writes are still being sent, by its `importing`, if
  // any: another one then would delete what this one writes, or the other
  // way round.
  const [writing, setWriting, { getSnapshot: getWriting }] = createState<
    ProjectImport | undefined
  >(undefined);

  /** The project as it stands, or why it cannot be had yet. */
  const current = (): Result<ProjectSnapshot, string> => {
    switch (deps.load.getSnapshot().value) {
      case 'loading':
        return Result.err(m.projectFile.stillLoading);

      case 'failed':
        return Result.err(m.projectFile.partlyLoaded);

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

      return Result.err(m.projectFile.exportFailed);
    }

    return Result.ok(fileName);
  };

  return {
    importState,
    importing: writing.pipe(map((which) => which !== undefined)),
    exportProject: () => {
      const exported =
        getWriting() === undefined
          ? Result.flatMap(current(), (snapshot) =>
              download(snapshot, 'task-manager'),
            )
          : Result.err(m.projectFile.exportWhileImporting);

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

      if (getWriting() !== undefined) {
        setImportState({
          ...asked,
          problem: m.projectFile.importWhileImporting,
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

      setWriting(importing);

      const end = (): void => {
        if (getWriting() === importing) {
          setWriting(undefined);
        }

        if (getSnapshot() === importing) {
          setImportState({ type: 'idle' });
        }
      };

      deps
        .replaceProject(asked.snapshot, previous.value)
        .catch((error: unknown) => {
          deps.reportError(
            m.projectFile.importFailed(asked.fileName, backup.value),
            error,
          );
        })
        .finally(end)
        // Only a failure to tell, or `end`'s own, is left for the console.
        .catch((error: unknown) => {
          console.error(error);
        });
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
        setWriting(undefined);

        setImportState({ type: 'idle' });
      });

      return () => {
        subscription.unsubscribe();
      };
    },
  };
};
