import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import {
  Arr,
  hasKey,
  isRecord,
  isString,
  Result,
  unknownToString,
} from 'ts-data-forge';
import { getWorkspacePackages, isDirectlyExecuted } from 'ts-repo-utils';
import type { MutableFixedLengthTuple, ReadonlyRecord } from 'ts-type-forge';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Fails when a script that resolves workspace siblings through their build
 * output does not start with `assert-deps-built.mts`, the guard that names a
 * missing `dist/` and says to run `pnpm run ws:build` (see its header).
 *
 * Which `dist/` a script needs is the guard's to work out from the dependency
 * graph; what is listed here is only which scripts run it. A new package
 * gets the wiring from copying another's scripts, and this is what notices
 * when it did not.
 */
export const checkDepsBuiltGuard = async (): Promise<
  Result<number, string>
> => {
  const rootScripts = await readScripts(projectRootPath);

  const members = await getWorkspacePackages(projectRootPath);

  const memberOffenders = await Promise.all(
    members.map(async (member) =>
      findUnguardedScripts({
        scripts: await readScripts(member.path),
        names: memberScripts,
        guard: `node ${path.relative(member.path, guardPath)}`,
      }).map(
        (name) => `${path.relative(projectRootPath, member.path)}: ${name}`,
      ),
    ),
  );

  const offenders = [
    ...findUnguardedScripts({
      scripts: rootScripts,
      names: rootWorkspaceScripts,
      guard: `node ./${path.relative(projectRootPath, guardPath)} --workspace`,
    }).map((name) => `package.json: ${name}`),
    ...findUnguardedScripts({
      scripts: rootScripts,
      names: rootPackageScripts,
      guard: `node ./${path.relative(projectRootPath, guardPath)}`,
    }).map((name) => `package.json: ${name}`),
    ...memberOffenders.flat(),
  ] as const;

  if (Arr.isNonEmpty(offenders)) {
    return Result.err(
      [
        `❌ ${offenders.length} script(s) do not start with the build-output guard:`,
        '',
        ...offenders.map((offender) => `  ${offender}`),
        '',
        'Prefix each with `node <path to>/tools/scripts/cmd/assert-deps-built.mts && `',
        '(`--workspace` for a root script that runs across the members), as',
        'its siblings are.',
      ].join('\n'),
    );
  }

  return Result.ok(members.length);
};

/**
 * The names among `names` whose script in `scripts` does not start with
 * `guard &&`. A name the manifest does not define is not an offender.
 */
export const findUnguardedScripts = ({
  scripts,
  names,
  guard,
}: Readonly<{
  scripts: ReadonlyRecord<string, string>;
  names: readonly string[];
  guard: string;
}>): readonly string[] =>
  names.filter(
    (name) =>
      hasKey(scripts, name) &&
      !(scripts[name] ?? '').startsWith(`${guard} && `),
  );

const guardPath = path.resolve(
  projectRootPath,
  'tools/scripts/cmd/assert-deps-built.mts',
);

/**
 * A member's scripts that type-check, lint or test it: each resolves the
 * siblings it imports through their `exports`. `doc`, `gen`, `check:e2e` and
 * `check:dist` are guarded at the root only.
 */
const memberScripts = [
  'check:types',
  'check:lint',
  'fix:lint',
  'check:test',
  'check:test:cov',
  'check:test:browser',
] as const;

/**
 * Root scripts that run a member script, or compile the members, across the
 * workspace.
 */
const rootWorkspaceScripts = [
  'check:root:dist-lib-replacement',
  'ws:check:types',
  'ws:check:lint',
  'ws:fix:lint',
  'ws:fix:lint:apps',
  'ws:fix:lint:non-apps',
  'ws:check:test',
  'ws:check:test:browser',
  'ws:check:test:cov:run',
  'ws:check:test:cov:shard-1',
  'ws:check:test:cov:shard-2',
  'ws:check:test:cov:shard-3',
  'ws:check:e2e',
  'ws:check:dist',
  'ws:doc',
  'ws:gen',
  'ws:gen:jsdoc',
  'ws:gen:readme',
  'check:knip',
] as const;

/**
 * Root scripts that load the root's own devDependencies (`tools/` type-checks,
 * tests and lint configs import `ts-data-forge`, `eslint-config-typed` and the
 * rest).
 */
const rootPackageScripts = [
  'check:root:types',
  'check:root:test',
  'check:root:lint',
  'check:published-deps',
] as const;

const readScripts = async (
  packageDir: string,
): Promise<ReadonlyRecord<string, string>> => {
  const manifest: unknown = JSON.parse(
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await fs.readFile(path.join(packageDir, 'package.json'), 'utf8'),
  );

  if (!isRecord(manifest) || !hasKey(manifest, 'scripts')) {
    return {};
  }

  const { scripts } = manifest;

  if (!isRecord(scripts)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(scripts).filter(
      (entry): entry is MutableFixedLengthTuple<2, string> =>
        isString(entry[1]),
    ),
  );
};

if (isDirectlyExecuted(import.meta.url)) {
  const result = await checkDepsBuiltGuard().catch((error: unknown) =>
    Result.err(unknownToString(error)),
  );

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(
    `${result.value} workspace member(s) checked; every guarded script starts with assert-deps-built.`,
  );
}
