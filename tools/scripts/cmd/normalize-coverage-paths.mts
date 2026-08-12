import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Result, unknownToString } from 'ts-data-forge';
import { glob, isDirectlyExecuted } from 'ts-repo-utils';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Rewrites each package's `lcov.info` so its `SF:` paths are relative to the
 * repository rather than to the package.
 *
 * Vitest writes them relative to the project, so every package's report calls
 * its own files `src/…`. Uploaded together, Codecov has to guess which package
 * each one belongs to, and where two packages hold the same relative path it
 * guesses once and keeps one:
 *
 *     libs/synstate-react-hooks/src/create-boolean-state.mts
 *     libs/synstate-preact-hooks/src/create-boolean-state.mts        ← lost
 *     libs/synstate-react-hooks-compat/src/create-boolean-state.mts  ← lost
 *
 * Those three packages are mirrors of one API, so their file names match
 * exactly, and only the first survived — the other two reported no coverage at
 * all. Naming the package in the path removes the guess.
 */
export const normalizeCoveragePaths = async (): Promise<
  Result<number, string>
> => {
  const found = await glob(
    `${projectRootPath}/{libs,apps}/*/coverage/lcov.info`,
  );

  if (Result.isErr(found)) {
    return Result.err(
      `Failed to look for coverage reports: ${unknownToString(found.value)}`,
    );
  }

  const mut_rewritten: string[] = [];

  for (const file of found.value) {
    const packageDir = path.resolve(path.dirname(file), '..');

    const prefix = path.relative(projectRootPath, packageDir);

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const before = await fs.readFile(file, 'utf8');

    const after = before
      .split('\n')
      .map((line) =>
        line.startsWith('SF:') && !line.startsWith(`SF:${prefix}/`)
          ? `SF:${path.join(prefix, line.slice('SF:'.length))}`
          : line,
      )
      .join('\n');

    if (after !== before) {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      await fs.writeFile(file, after);

      mut_rewritten.push(prefix);
    }
  }

  return Result.ok(mut_rewritten.length);
};

if (isDirectlyExecuted(import.meta.url)) {
  const result = await normalizeCoveragePaths();

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(
    result.value === 0
      ? 'Coverage paths already name their package.'
      : `Rewrote the paths in ${result.value} coverage report(s).`,
  );
}
