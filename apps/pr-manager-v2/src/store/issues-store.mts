import { issueTierOf, type ReadError, type Snapshot } from 'pr-report-core-v2';
import {
  combine,
  createState,
  map,
  skipIfNoChange,
  type InitializedObservable,
} from 'synstate';
import { Arr, fastDeepEqual, Result } from 'ts-data-forge';
import {
  isListed,
  issueGraphOf,
  issueRowOf,
  issueTileCounts,
  issueTitlesOf,
  passesTiers,
  sortIssues,
  tierSettingsOf,
  type DagZoom,
  type IssueGraph,
  type IssueRow,
  type IssuesSettings,
} from '../domain/index.mjs';
import type { PageReport } from './report-store.mjs';
import type { UrlField } from './url-store.mjs';

/** What the open issues block draws (spec §11). */
export type IssuesBlockView = Readonly<
  | { kind: 'unread'; reason: string | undefined }
  | {
      kind: 'ready';
      /** Every open issue read, by number. */
      rows: ReadonlyMap<number, IssueRow>;
      /** The list as filtered, searched and sorted. */
      listed: readonly IssueRow[];
      /** The issues the DAG draws: only the tiers and in progress filter it. */
      drawn: readonly IssueRow[];
      /** The DAG of `drawn`, with what they wait on and what closes them. */
      graph: IssueGraph;
      listCounts: ReturnType<typeof issueTileCounts>;
      dagCounts: ReturnType<typeof issueTileCounts>;
      /** Every label on an open issue but the tiers, for the label picks. */
      labelNames: readonly string[];
      /** Whether the list stopped short of every open issue. */
      incomplete: boolean;
      failures: readonly ReadError[];
      snapshot: Snapshot;
    }
>;

export type IssuesStore = Readonly<{
  settings: InitializedObservable<IssuesSettings>;
  update: (fn: (prev: IssuesSettings) => IssuesSettings) => void;
  /** The search box: not kept in the URL. */
  query: InitializedObservable<string>;
  setQuery: (query: string) => void;
  view: InitializedObservable<IssuesBlockView>;
  zoom: InitializedObservable<DagZoom>;
  setZoom: (zoom: DagZoom) => void;
}>;

export const createIssuesStore = (
  deps: Readonly<{
    report: InitializedObservable<PageReport | undefined>;
    field: UrlField<IssuesSettings>;
    zoom: UrlField<DagZoom>;
  }>,
): IssuesStore => {
  const [query, setQuery] = createState('');

  const rows = deps.report.pipe(
    map((report) => {
      if (report === undefined || Result.isErr(report.issueDecision)) {
        return Result.err(
          report === undefined || Result.isOk(report.issueDecision)
            ? undefined
            : report.issueDecision.value.message,
        );
      }

      const { issues } = report.issueDecision.value;

      if (Result.isErr(issues)) {
        return Result.err(issues.value.message);
      }

      const titles = issueTitlesOf(report.snapshot);

      return Result.ok({
        report,
        pullRequests: report.issueDecision.value.pullRequests,
        rows: new Map<number, IssueRow>(
          issues.value.map((d) => [
            d.facts.number,
            issueRowOf(d, titles, report.readAtMs),
          ]),
        ),
      });
    }),
  );

  // The DAG reads the tiers alone, never the search box, so typing in it does
  // not build the graph again (and the DAG does not lay it out again).
  const tiers = deps.field.value
    .pipe(map(tierSettingsOf))
    .pipe(skipIfNoChange(fastDeepEqual));

  const dag = combine([rows, tiers]).pipe(
    map(([read, settings]) => {
      if (Result.isErr(read)) {
        return undefined;
      }

      const { report, rows: byNumber, pullRequests } = read.value;

      const drawn = Array.from(byNumber.values()).filter((row) =>
        passesTiers(row, settings),
      );

      return {
        drawn,
        graph: issueGraphOf(drawn, byNumber, pullRequests, report.snapshot),
      };
    }),
  );

  const view = combine([rows, deps.field.value, query, dag]).pipe(
    map(([read, settings, q, drawnGraph]): IssuesBlockView => {
      if (drawnGraph === undefined || Result.isErr(read)) {
        return {
          kind: 'unread',
          reason: Result.isErr(read) ? read.value : undefined,
        };
      }

      const { report, rows: byNumber } = read.value;

      const list = Array.from(byNumber.values());

      const listedOf = (row: IssueRow, s: IssuesSettings): boolean =>
        isListed(row, s, q);

      return {
        kind: 'ready',
        rows: byNumber,
        listed: sortIssues(
          list.filter((row) => listedOf(row, settings)),
          settings.sort,
        ),
        drawn: drawnGraph.drawn,
        graph: drawnGraph.graph,
        listCounts: issueTileCounts(list, settings, listedOf),
        dagCounts: issueTileCounts(list, settings, passesTiers),
        labelNames: Arr.uniq(
          list.flatMap(({ labels }) =>
            labels
              .map(({ name }) => name)
              .filter((name) => issueTierOf([name]) === 'none'),
          ),
        ).toSorted((a, b) => a.localeCompare(b)),
        incomplete:
          Result.isOk(report.snapshot.openIssues) &&
          !report.snapshot.openIssues.value.complete,
        failures: report.failures.issues,
        snapshot: report.snapshot,
      };
    }),
  );

  return {
    settings: deps.field.value,
    update: deps.field.update,
    query,
    setQuery,
    view,
    zoom: deps.zoom.value,
    setZoom: (zoom) => {
      deps.zoom.update(() => zoom);
    },
  };
};
