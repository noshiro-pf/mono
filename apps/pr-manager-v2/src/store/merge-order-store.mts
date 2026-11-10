import type { ReadError } from 'pr-report-core-v2';
import { combine, map, type InitializedObservable } from 'synstate';
import { Arr, Result } from 'ts-data-forge';
import {
  availableStatuses,
  cardOf,
  isShown,
  shownTree,
  tileCounts,
  withAvailable,
  type MergeOrderCard,
  type MergeOrderSettings,
  type MergeOrderStatus,
  type ShownNode,
} from '../domain/index.mjs';
import type { PageReport } from './report-store.mjs';
import type { UrlField } from './url-store.mjs';

/** What the merge order block draws (spec §7). */
export type MergeOrderView = Readonly<
  | { kind: 'unread'; reason: string | undefined }
  | {
      kind: 'ready';
      cards: ReadonlyMap<number, MergeOrderCard>;
      tree: readonly ShownNode[];
      /** Each `Merge-After:` cycle, its members that are shown. */
      cycles: readonly (readonly MergeOrderCard[])[];
      counts: ReturnType<typeof tileCounts>;
      /** The status tiles this repository offers. */
      available: readonly MergeOrderStatus[];
      /** The settings as they apply here: see {@link withAvailable}. */
      applied: MergeOrderSettings;
      /**
       * The most commits any card is ahead or behind: one scale for every
       * divergence bar, so `-2` and `-39` are not drawn the same length.
       */
      scaleMax: number;
      /** What failed in the latest read, its last answer drawn instead. */
      failures: readonly ReadError[];
    }
>;

export type MergeOrderStore = Readonly<{
  settings: InitializedObservable<MergeOrderSettings>;
  update: (fn: (prev: MergeOrderSettings) => MergeOrderSettings) => void;
  view: InitializedObservable<MergeOrderView>;
}>;

export const createMergeOrderStore = (
  deps: Readonly<{
    report: InitializedObservable<PageReport | undefined>;
    field: UrlField<MergeOrderSettings>;
  }>,
): MergeOrderStore => {
  const cards = deps.report.pipe(
    map((report) => {
      if (report === undefined || Result.isErr(report.decision)) {
        return Result.err(
          report === undefined || Result.isOk(report.decision)
            ? undefined
            : report.decision.value.message,
        );
      }

      const decision = report.decision.value;

      return Result.ok({
        report,
        decision,
        cards: new Map<number, MergeOrderCard>(
          decision.pullRequests.map((d) => [
            d.facts.number,
            cardOf(d, report.snapshot, report.readAtMs),
          ]),
        ),
      });
    }),
  );

  const view = combine([cards, deps.field.value]).pipe(
    map(([read, settings]): MergeOrderView => {
      if (Result.isErr(read)) {
        return { kind: 'unread', reason: read.value };
      }

      const { report, decision, cards: byNumber } = read.value;

      const { snapshot } = report;

      const list = Array.from(byNumber.values());

      const available = availableStatuses(
        Result.isOk(snapshot.repository.hasQueueLabel) &&
          snapshot.repository.hasQueueLabel.value,
        Result.isOk(snapshot.requirements) &&
          snapshot.requirements.value.requireCodeOwnerReview,
      );

      const applied = withAvailable(settings, available);

      return {
        kind: 'ready',
        cards: byNumber,
        tree: shownTree(decision.forest.roots, byNumber, applied),
        cycles: decision.forest.cycles
          .map((cycle) =>
            Arr.generate(function* () {
              for (const number of cycle) {
                const card = byNumber.get(number);

                if (card !== undefined && isShown(card, applied)) {
                  yield card;
                }
              }
            }),
          )
          .filter(Arr.isNonEmpty),
        counts: tileCounts(list, applied),
        available,
        applied,
        scaleMax: Math.max(
          0,
          ...list.map(({ comparison }) =>
            comparison === undefined
              ? 0
              : Math.max(comparison.aheadBy, comparison.behindBy),
          ),
        ),
        failures: report.failures.report,
      };
    }),
  );

  return {
    settings: deps.field.value,
    update: deps.field.update,
    view,
  };
};
