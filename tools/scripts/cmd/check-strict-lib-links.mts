import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr, Result, unknownToString } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Fails when the `@typescript/lib-*` links that supply the strict standard
 * library are missing or point somewhere else.
 *
 * Both routes into the compiler go through these names. Type checking runs
 * `typescript-native` (7.x) and linting runs the `typescript` module (6.x),
 * because that is what typescript-eslint imports — and both resolve a lib
 * replacement as an ordinary package-name lookup once `libReplacement` is on.
 * `strict-ts-lib-v7.0`'s linker, run by the root `prepare` script, writes one
 * symlink per lib group so that lookup finds the strict declarations.
 *
 * Without the links both quietly fall back to TypeScript's own declarations and
 * stop enforcing anything — no error, just a weaker check. That is the failure
 * this exists to make loud.
 */
export const checkStrictLibLinks = async (
  root: string = projectRootPath,
): Promise<Result<number, string>> => {
  const scopeDir = path.resolve(root, 'node_modules', SCOPE);

  const libsDir = path.resolve(root, 'node_modules', BUNDLE_NAME, 'libs');

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const groups = await fs.readdir(libsDir).catch(() => undefined);

  if (groups === undefined) {
    return Result.err(
      `${BUNDLE_NAME} is not installed: ${path.relative(root, libsDir)} does not exist.`,
    );
  }

  const checked = await Promise.all(
    groups.map(async (group) => {
      const link = path.resolve(scopeDir, `lib-${group}`);

      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const resolved = await fs.realpath(link).catch(() => undefined);

      // Resolved too, so that a bundle reached through a symlink (pnpm's store)
      // compares equal to a link that resolves into the same place.
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const expected = await fs.realpath(path.resolve(libsDir, group));

      return { group, resolved, expected } as const;
    }),
  );

  const missing = checked
    .filter(({ resolved }) => resolved === undefined)
    .map(({ group }) => `  ${SCOPE}/lib-${group}`);

  const misdirected = Arr.generate(function* () {
    for (const { group, resolved, expected } of checked) {
      if (resolved !== undefined && resolved !== expected) {
        yield `  ${SCOPE}/lib-${group} points at ${displayPath(root, resolved)}, expected ${displayPath(root, expected)}`;
      }
    }
  });

  if (Arr.isNonEmpty(missing) || Arr.isNonEmpty(misdirected)) {
    return Result.err(
      [
        ...(Arr.isNonEmpty(missing)
          ? [
              `${missing.length} of ${groups.length} \`${SCOPE}/lib-*\` link(s) are missing:`,
              '',
              ...missing,
              '',
            ]
          : []),
        ...(Arr.isNonEmpty(misdirected)
          ? [
              `${misdirected.length} of ${groups.length} \`${SCOPE}/lib-*\` link(s) point somewhere other than ${BUNDLE_NAME}:`,
              '',
              ...misdirected,
              '',
            ]
          : []),
        'Run `pnpm run z:link-strict-lib` to restore them. `pnpm install`',
        'does it too, through the root `prepare` script.',
      ].join('\n'),
    );
  }

  return Result.ok(checked.length);
};

/**
 * One bundle serves both compilers. TypeScript 6.0.3 compiles this lib set with
 * `skipLibCheck: false` and no errors, which is why the package declares
 * `typescript >=6.0.0 <8.0.0` and why there is no second bundle here.
 */
const BUNDLE_NAME = 'strict-ts-lib-v7.0';

const SCOPE = '@typescript';

/** A path under `root` relative to it, and any other as it is. */
const displayPath = (root: string, target: string): string => {
  const relative = path.relative(root, target);

  return relative.startsWith('..') || path.isAbsolute(relative)
    ? target
    : relative;
};

if (isDirectlyExecuted(import.meta.url)) {
  const result = await checkStrictLibLinks().catch((error: unknown) =>
    Result.err(unknownToString(error)),
  );

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(
    `${result.value} ${SCOPE}/lib-* link(s) resolve into ${BUNDLE_NAME}.`,
  );
}
