import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr, Result, unknownToString } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Fails when the `@typescript/lib-*` links that give **ESLint** the strict
 * standard library are missing or point somewhere else.
 *
 * Type checking and linting reach the same library by opposite routes, because
 * they run different TypeScript versions:
 *
 * - **Type checking** runs `typescript-native` (7.x), which resolves a lib
 *   replacement through `paths` — that is what
 *   `check:root:tsconfig-lib-paths` guards.
 * - **Linting** runs the `typescript` module (6.x), because that is what
 *   typescript-eslint imports. TypeScript 6 ignores `paths` here and resolves
 *   `@typescript/lib-*` as ordinary package names, so `paths` does nothing for
 *   it. The names come from `strict-ts-lib-v6.0`'s own linker, run by the
 *   root `prepare` script.
 *
 * Without the links, lint quietly falls back to TypeScript's own declarations
 * and stops enforcing what the type check enforces — no error, just a weaker
 * lint. That is the failure this check exists to make loud.
 *
 * The two libraries are the same rewrite generated from adjacent TypeScript
 * minors. Their generated declarations differ in four lines, all parameter
 * names on `padStart` / `padEnd`, which do not affect checking; see
 * `strict-lib/v7.0/diff-from-prev/`.
 */
export const checkStrictLibLinks = async (): Promise<
  Result<number, string>
> => {
  const scopeDir = path.resolve(projectRootPath, 'node_modules', SCOPE);

  const libsDir = path.resolve(
    projectRootPath,
    'node_modules',
    BUNDLE_NAME,
    'libs',
  );

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const groups = await fs.readdir(libsDir).catch(() => undefined);

  if (groups === undefined) {
    return Result.err(
      `${BUNDLE_NAME} is not installed: ${path.relative(projectRootPath, libsDir)} does not exist.`,
    );
  }

  const checked = await Promise.all(
    groups.map(async (group) => {
      const link = path.resolve(scopeDir, `lib-${group}`);

      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const resolved = await fs.realpath(link).catch(() => undefined);

      return { group, link, resolved };
    }),
  );

  const offenders = checked
    .filter(({ resolved }) => resolved === undefined)
    .map(({ group }) => group);

  if (Arr.isNonEmpty(offenders)) {
    return Result.err(
      [
        `${offenders.length} of ${groups.length} \`${SCOPE}/lib-*\` link(s) are missing:`,
        '',
        ...offenders.map((group) => `  ${SCOPE}/lib-${group}`),
        '',
        `Run \`pnpm run z:link-strict-lib\` to restore them. \`pnpm install\``,
        'does it too, through the root `prepare` script.',
      ].join('\n'),
    );
  }

  return Result.ok(checked.length);
};

/**
 * The bundle linting resolves by name. Not `strict-ts-lib-v7.0`: that one
 * declares `typescript >=7.0.0 <7.1.0`, and its declarations reference lib
 * names TypeScript 6 does not have.
 */
const BUNDLE_NAME = 'strict-ts-lib-v6.0';

const SCOPE = '@typescript';

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
