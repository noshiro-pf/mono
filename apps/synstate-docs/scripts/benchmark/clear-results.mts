import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { isResultsMarkdown, isResultsTable, resultsDir } from './paths.mjs';

/**
 * Deletes every table under `resultsDir`, JSON and Markdown, before a full
 * measurement (`z:benchmark:measure`) writes them again.
 *
 * Each runner writes only its own tables, so without this a table no runner
 * writes any more — a scenario removed from the runners — would stay behind
 * unchanged, equal to the committed one, and pass as measured: locally, and in
 * the benchmark workflow, whose measurement is judged against the committed
 * tables (`check-drift.mts`). A runner that stops writing a table the
 * `src/data` barrel still imports fails `z:benchmark:check-measurement` on that
 * import instead. The single-scenario `benchmark:*` scripts do not clear.
 *
 * A local run stopped partway leaves the tables it did not reach deleted;
 * `git restore --source=HEAD --staged --worktree --
 * ':/apps/synstate-docs/src/data/results*'` brings the committed ones back,
 * from any directory.
 */
// eslint-disable-next-line security/detect-non-literal-fs-filename
const files = await fs.readdir(resultsDir);

const tables = files.filter(
  (file) => isResultsTable(file) || isResultsMarkdown(file),
);

await Promise.all(
  tables.map(async (file) => fs.rm(path.resolve(resultsDir, file))),
);

console.info(
  `Cleared ${tables.length.toString()} table file(s) from ${resultsDir}.`,
);
