import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import {
  Arr,
  isRecord,
  isString,
  Json,
  Result,
  unknownToString,
} from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import {
  PNPM_WORKSPACE_FILE_NAME,
  readPnpmWorkspaceGlobs,
} from '../lib/workspace-globs.mjs';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Fails unless the root `package.json` `workspaces` names the same globs as
 * `pnpm-workspace.yaml` `packages`.
 *
 * pnpm installs and links what `pnpm-workspace.yaml` names, and that is where a
 * new member is added; the `pnpm run --recursive` sweeps (`ws:gen`,
 * `ws:check:*`) follow it too. But `ws:build` and `ws:build:deps` list members
 * through `ts-repo-utils`' `getWorkspacePackages`, and the
 * `assert-deps-built --workspace` prefix of those sweeps checks their `dist/`,
 * both from `workspaces` — so a glob added to `pnpm-workspace.yaml` alone is a
 * member that is never built and whose missing `dist/` nothing names, until a
 * check that imports it fails. Order does not matter; neither list is read in
 * order. A negated glob is refused in either list, since only pnpm reads one as
 * an exclusion.
 */
export const checkWorkspaceGlobs = async (): Promise<
  Result<number, string>
> => {
  const pnpmWorkspace = await readPnpmWorkspaceGlobs();

  if (Result.isErr(pnpmWorkspace)) {
    return Result.err(`❌ ${pnpmWorkspace.value}`);
  }

  const rootWorkspaces = await readRootWorkspaces();

  if (Result.isErr(rootWorkspaces)) {
    return Result.err(`❌ ${rootWorkspaces.value}`);
  }

  const negated = [...pnpmWorkspace.value, ...rootWorkspaces.value].filter(
    (glob) => glob.startsWith('!'),
  );

  if (Arr.isNonEmpty(negated)) {
    return Result.err(
      [
        `❌ ${PNPM_WORKSPACE_FILE_NAME} \`packages\` or the root package.json \`workspaces\` has negated glob(s):`,
        '',
        ...negated.map((glob) => `  ${glob}`),
        '',
        'pnpm reads one as an exclusion, but `getWorkspacePackages` and',
        '`assert-deps-built` glob each entry of `workspaces` on its own, so',
        'there it excludes nothing. Narrow the positive globs instead.',
      ].join('\n'),
    );
  }

  const mismatches = findWorkspaceGlobMismatches({
    pnpmWorkspace: pnpmWorkspace.value,
    rootWorkspaces: rootWorkspaces.value,
  });

  if (Arr.isNonEmpty(mismatches)) {
    return Result.err(
      [
        `❌ ${PNPM_WORKSPACE_FILE_NAME} \`packages\` and the root package.json \`workspaces\` disagree:`,
        '',
        ...mismatches.map(
          ({ glob, missingFrom }) => `  ${glob}  (missing from ${missingFrom})`,
        ),
        '',
        'Add each glob to the list that lacks it, or remove it from both.',
        'pnpm reads the first; `ws:build` and `assert-deps-built` read the second.',
      ].join('\n'),
    );
  }

  return Result.ok(pnpmWorkspace.value.length);
};

/** The globs one list has and the other lacks. */
export const findWorkspaceGlobMismatches = ({
  pnpmWorkspace,
  rootWorkspaces,
}: Readonly<{
  pnpmWorkspace: readonly string[];
  rootWorkspaces: readonly string[];
}>): readonly WorkspaceGlobMismatch[] =>
  [
    ...pnpmWorkspace
      .filter((glob) => !rootWorkspaces.includes(glob))
      .map((glob) => ({ glob, missingFrom: 'package.json' }) as const),
    ...rootWorkspaces
      .filter((glob) => !pnpmWorkspace.includes(glob))
      .map(
        (glob) => ({ glob, missingFrom: PNPM_WORKSPACE_FILE_NAME }) as const,
      ),
  ] as const;

type WorkspaceGlobMismatch = Readonly<{
  glob: string;
  missingFrom: 'package.json' | typeof PNPM_WORKSPACE_FILE_NAME;
}>;

const readRootWorkspaces = async (): Promise<
  Result<readonly string[], string>
> => {
  const content = await Result.fromPromise(
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.readFile(path.join(projectRootPath, 'package.json'), 'utf8'),
  );

  if (Result.isErr(content)) {
    return Result.err(
      `Failed to read package.json: ${unknownToString(content.value)}`,
    );
  }

  const manifest = Json.parse(content.value);

  if (Result.isErr(manifest)) {
    return Result.err(`Failed to parse package.json: ${manifest.value}`);
  }

  const workspaces = isRecord(manifest.value)
    ? manifest.value['workspaces']
    : undefined;

  if (!Arr.isArray(workspaces) || !workspaces.every(isString)) {
    return Result.err(
      'The root package.json `workspaces` is not an array of strings.',
    );
  }

  return Result.ok(workspaces);
};

if (isDirectlyExecuted(import.meta.url)) {
  const result = await checkWorkspaceGlobs().catch((error: unknown) =>
    Result.err(unknownToString(error)),
  );

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(
    `${result.value} workspace glob(s) agree between ${PNPM_WORKSPACE_FILE_NAME} and package.json.`,
  );
}
