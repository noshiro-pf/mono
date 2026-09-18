import * as path from 'node:path';
import { workspaceRootPath } from '../workspace-root-path.mjs';

/**
 * Where the scenario sources live, which is still `libs/synstate/samples/`.
 *
 * They did not move here with the runners. They are synstate usage samples:
 * type-checked in that package against the comparison libraries it devDepends
 * on (`rxjs`, `jotai`, `mobx`, `@reduxjs/toolkit`, `zustand`, `valtio`), and
 * embedded into this site as the code listings beside each table. What moved
 * is the measuring, which is a documentation concern — the numbers exist only
 * because the docs quote them.
 */
export const scenarioDir = path.resolve(
  workspaceRootPath,
  '../../libs/synstate/samples/docs-site/benchmark',
);

/**
 * Where a run writes its tables and JSON — inside this package, next to
 * everything that reads them.
 *
 * It used to be the scenario directory, so the results sat in `libs/synstate`
 * while every consumer (`embed-benchmark.mts`, `benchmark-numbers.mts`, the
 * chart components) was here and reached them by a
 * `../../../../../libs/synstate/...` import.
 *
 * Flat rather than a `benchmark/` subdirectory, because `src/data/index.mts`
 * is what the chart components are allowed to import:
 * `import-x/no-internal-modules` permits `../../<dir>/index.mjs` and nothing
 * deeper.
 */
export const resultsDir = path.resolve(workspaceRootPath, 'src/data');
