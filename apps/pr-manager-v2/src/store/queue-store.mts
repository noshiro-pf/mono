import type { ReadError } from 'pr-report-core-v2';
import { map, type InitializedObservable } from 'synstate';
import { Result } from 'ts-data-forge';
import { queueViewOf, type QueueView } from '../domain/index.mjs';
import type { PageReport } from './report-store.mjs';

/** What the queue block draws (spec §8). */
export type QueueBlockView = Readonly<
  | {
      /** Not read yet, or the decision failed (`reason`). */
      kind: 'unread';
      reason: string | undefined;
    }
  | {
      /** The repository has no `merge-queued` label: no queue runs there. */
      kind: 'absent';
    }
  | {
      kind: 'ready';
      view: QueueView;
      /** What the read could not get, which the order may rest on. */
      failures: readonly ReadError[];
    }
>;

export const queueBlockViewOf = (
  report: InitializedObservable<PageReport | undefined>,
): InitializedObservable<QueueBlockView> =>
  report.pipe(
    map((r): QueueBlockView => {
      if (r === undefined) {
        return { kind: 'unread', reason: undefined };
      }

      const { hasQueueLabel } = r.snapshot.repository;

      return Result.isOk(hasQueueLabel) && !hasQueueLabel.value
        ? { kind: 'absent' }
        : Result.isErr(r.decision)
          ? { kind: 'unread', reason: r.decision.value.message }
          : {
              kind: 'ready',
              view: queueViewOf(r.decision.value, r.snapshot),
              // All of the report's: the decision reads each of them (set-aside
              // records are comments, Start-After comes through the closing
              // issues, merge state from the comparison).
              failures: r.failures.report,
            };
    }),
  );
