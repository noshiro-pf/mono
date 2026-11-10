/**
 * The workflow runs `unblock-prs` has dispatched on a queue layer's commit,
 * read as the worker reads them: the same REST request (`layerRunsRequest` in
 * `pr-report-core`), so that `layerRunsVerdict` judges the layer from the same
 * runs on the page as in the worker. GraphQL's check suites would need guessing
 * at which suite is which attempt of which run.
 *
 * REST, as the default branch's rules are (`rest-json.mts`): its own budget,
 * one request a layer, revalidated so that a layer whose runs have not changed
 * costs nothing.
 */

import { layerRunsRequest, type DispatchedRun } from 'pr-report-core';
import { Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import type { ReportSource } from './constants.mjs';
import { askGitHub, getJson, type RestFetch } from './rest-json.mjs';

/** The runs dispatched on `tip`, or why they could not be read. */
export const loadLayerRuns = async (
  source: ReportSource,
  tip: string,
  request: Readonly<{ token: string; fetchImpl?: RestFetch }>,
): Promise<Result<readonly DispatchedRun[], string>> => {
  const { route, query } = layerRunsRequest(tip);

  const search = new URLSearchParams(query);

  const read = await getJson(
    `https://api.github.com/repos/${source.owner}/${source.repo}${route}?${search.toString()}`,
    RunsSchema,
    `the runs on queue layer ${tip.slice(0, 7)}`,
    request.token,
    request.fetchImpl ?? askGitHub,
  );

  return Result.map(read, ({ workflow_runs }) => workflow_runs);
};

/** Held to `DispatchedRun`, as the worker's reading of the same answer is. */
const RunsSchema: t.Type<
  Readonly<{ workflow_runs: readonly DispatchedRun[] }>
> = t.record({
  workflow_runs: t.array(
    t.record({
      id: t.number(),
      path: t.string(),
      status: t.string(),
      conclusion: t.union([t.string(), t.nullType]),
      html_url: t.string(),
    }),
  ),
});
