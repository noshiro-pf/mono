import { Arr, Result } from 'ts-data-forge';
import * as t from 'ts-fortress';

/**
 * Parses `src/data/benchmark-results.json`, so that a file written by an older
 * runner, or edited by hand, is reported as such.
 */
export const parseResults = (
  json: string,
): Result<BenchmarkResults, string> => {
  const parsed = BenchmarkResultsSchema.validate(JSON.parse(json));

  return Result.isErr(parsed)
    ? Result.err(
        Arr.toUnshifted('not in the shape of a benchmark results file:')(
          t.validationErrorsToMessages(parsed.value),
        ).join('\n'),
      )
    : parsed;
};

const BenchmarkResultsSchema = t.record({
  environment: t.record({
    node: t.string(),
    os: t.string(),
    cpu: t.string(),
    /** The installed versions of the other libraries. */
    libraries: t.keyValueRecord(t.string(), t.string()),
    /** `YYYY-MM-DD`, in UTC. */
    measuredOn: t.string(),
  }),
  scenarios: t.keyValueRecord(
    t.string(),
    t.union([
      t.record({
        kind: t.literal('stats'),
        /** Each library's measured times, in ms, in the order they were run. */
        rows: t.array(
          t.record({ label: t.string(), times: t.array(t.number()) }),
        ),
      }),
      t.record({
        kind: t.literal('series'),
        xLabels: t.array(t.string()),
        /** Each library's median at each point, in ms; `null` past a timeout. */
        rows: t.array(
          t.record({
            label: t.string(),
            values: t.array(t.union([t.number(), t.nullType])),
          }),
        ),
      }),
    ]),
  ),
});

/**
 * What a measuring process sends `run-benchmark.mts` for one library: every
 * measured time of a `stats` scenario, or each point's median of a sweep, `null`
 * past a timeout.
 */
export const EntryResultSchema = t.union([
  t.record({ kind: t.literal('times'), times: t.array(t.number()) }),
  t.record({
    kind: t.literal('series'),
    xLabels: t.array(t.string()),
    values: t.array(t.union([t.number(), t.nullType])),
  }),
]);

export type EntryResult = t.TypeOf<typeof EntryResultSchema>;

/** What `run-benchmark.mts` writes and `embed-benchmark.mts` reads. */
export type BenchmarkResults = t.TypeOf<typeof BenchmarkResultsSchema>;

export type ScenarioResult = BenchmarkResults['scenarios'][string];
