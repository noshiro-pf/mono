import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr, Result, unknownToString } from 'ts-data-forge';
import { glob, isDirectlyExecuted } from 'ts-repo-utils';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Fails when a `tsconfig.json` that defines `paths` leaves out the strict
 * standard library's entry.
 *
 * The libraries live inside one package, so `libReplacement` finds them only
 * through `"@typescript/lib-*": [".../strict-ts-lib-v7.0/libs/*"]`. The shared
 * config carries that mapping — but `paths` is **replaced, not merged**, by a
 * config that `extends` another, so any package that sets `paths` of its own
 * drops it. Most of them do.
 *
 * Nothing reports that. TypeScript looks the libraries up, does not find them,
 * and silently keeps its own declarations: the package stops being checked
 * against the strict library while still looking opted in. This check is what
 * turns that into a failure, and it holds for packages that have not opted in
 * yet too, so the mapping is already right when they do.
 *
 * A package that says `"libReplacement": false` is exempt, because it has
 * stated the opposite intent in the one place that decides it. `ts-type-forge`
 * is the case: the strict library's declarations import it, so opting it in
 * would make the dependency mutual — see
 * `docs/strict-typescript-lib-integration.md`. Leaving the mapping in such a
 * package would be misleading rather than harmless, since it reads as an
 * opt-in that never happens.
 */
export const checkTsconfigLibPaths = async (): Promise<
  Result<number, string>
> => {
  const found = await glob(`${projectRootPath}/{libs,apps}/*/tsconfig.json`);

  if (Result.isErr(found)) {
    return Result.err(
      `Failed to look for tsconfig files: ${unknownToString(found.value)}`,
    );
  }

  const contents = await Promise.all(
    found.value.map(async (file) => ({
      file,
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      text: await fs.readFile(file, 'utf8'),
    })),
  );

  const offenders = contents
    .filter(
      ({ text }) =>
        text.includes(PATHS_KEY) &&
        !text.includes(LIB_KEY) &&
        !text.includes(OPT_OUT_KEY),
    )
    .map(({ file }) => path.relative(projectRootPath, file));

  if (!Arr.isNonEmpty(offenders)) {
    return Result.ok(
      contents.filter(({ text }) => text.includes(LIB_KEY)).length,
    );
  }

  return Result.err(
    [
      `${offenders.length} tsconfig file(s) define \`paths\` without the strict standard library's entry:`,
      '',
      ...offenders.map((file) => `  ${file}`),
      '',
      "Add it alongside the package's own mappings, relative to that file:",
      '',
      `  ${LIB_KEY}: ["../../node_modules/${BUNDLE_NAME}/libs/*"]`,
      '',
      "Without it the package keeps TypeScript's own declarations, with no",
      'diagnostic to say so. If the package is meant to stay on the stock',
      `library, say so with ${OPT_OUT_KEY} instead — and write down why.`,
    ].join('\n'),
  );
};

/** The one package every built-in library ships inside. */
const BUNDLE_NAME = 'strict-ts-lib-v7.0';

const PATHS_KEY = '"paths"';

/** A package that states this has opted out on purpose; see the doc comment. */
const OPT_OUT_KEY = '"libReplacement": false';

const LIB_KEY = '"@typescript/lib-*"';

if (isDirectlyExecuted(import.meta.url)) {
  const result = await checkTsconfigLibPaths();

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(
    `${result.value} tsconfig file(s) map @typescript/lib-* onto ${BUNDLE_NAME}.`,
  );
}
