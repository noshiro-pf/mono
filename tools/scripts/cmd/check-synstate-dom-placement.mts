import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Result, unknownToString } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import {
  benchmarkPages,
  checkPlacement,
  embedPlacement,
  pageLocale,
  placementPages,
  readResults,
} from '../lib/synstate-dom-benchmark-results.mjs';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Fails when a page that places synstate-dom among the libraries of
 * js-framework-benchmark does not carry the figures its one writer would write
 * there now, or when RESULTS.md no longer bears out the placement.
 *
 * The SynState site's generator writes most of those pages, and a
 * re-measurement, a change to `placement` in
 * `tools/scripts/lib/synstate-dom-benchmark-results.mts` or an edit inside one of
 * their `benchmark:` markers runs no generator that would notice. A guard reads
 * the committed tree, so it neither races `pnpm run --recursive gen` nor
 * depends on which site's `gen` runs first.
 */
export const checkSynstateDomPlacement = async (): Promise<
  Result<number, string>
> => {
  const results = await readResults();

  if (Result.isErr(results)) {
    return results;
  }

  const { operations } = results.value;

  const placed = checkPlacement(operations);

  if (Result.isErr(placed)) {
    return placed;
  }

  const pages = [
    ...placementPages.map(
      (pagePath) => [pagePath, 'reject', placementPagesWriter] as const,
    ),
    // The benchmark pages' tables are their own generator's to check.
    ...benchmarkPages.map(
      (pagePath) => [pagePath, 'keep', benchmarkPagesWriter] as const,
    ),
  ] as const;

  for (const [pagePath, otherMarkers, writer] of pages) {
    const name = path.relative(projectRootPath, pagePath);

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const page = await fs.readFile(pagePath, 'utf8');

    const embedded = embedPlacement(
      page,
      operations,
      pageLocale(pagePath),
      otherMarkers,
    );

    if (Result.isErr(embedded)) {
      return Result.err(`${name}: ${embedded.value}`);
    }

    if (embedded.value !== page) {
      return Result.err(
        `${name} does not carry the placement figures RESULTS.md and \`placement\` give now: a re-measurement, a change to \`placement\`, or an edit inside a \`benchmark:\` marker. Run ${writer}, which writes that page.`,
      );
    }
  }

  return Result.ok(pages.length);
};

/** The command that writes each kind of page, for the error to name. */
const placementPagesWriter =
  '`pnpm --filter @synstate/docs run gen:benchmark-doc`';

const benchmarkPagesWriter =
  '`pnpm --filter synstate-dom-docs run gen:benchmark`';

if (isDirectlyExecuted(import.meta.url)) {
  const result = await checkSynstateDomPlacement().catch((error: unknown) =>
    Result.err(unknownToString(error)),
  );

  if (Result.isErr(result)) {
    console.error(`❌ ${result.value}`);

    process.exit(1);
  }

  console.info(
    `The pages placing synstate-dom are current (${result.value.toString()} pages read).`,
  );
}
