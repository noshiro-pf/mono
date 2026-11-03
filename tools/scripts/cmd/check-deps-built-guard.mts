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
 * graph; what is listed here is only which scripts run it. A new package gets
 * the wiring from copying another's scripts, and this is what notices when it
 * did not. A root script that starts with the guard but is missing from the
 * lists fails too: unlisted, it could lose the guard unnoticed.
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

  const rootPackageGuard =
    `node ./${path.relative(projectRootPath, guardPath)}` as const;

  const rootWorkspaceGuard = `${rootPackageGuard} --workspace` as const;

  // A root script that already starts with a form of the guard but is not in
  // that form's list would lose the guard unnoticed. One sitting in the other
  // form's list is reported here, with the list it belongs in, and not again as
  // unguarded below.
  const unlistedWorkspace = findUnlistedGuardedScripts({
    scripts: rootScripts,
    names: rootWorkspaceScripts,
    guard: rootWorkspaceGuard,
  });

  const unlistedPackage = findUnlistedGuardedScripts({
    scripts: rootScripts,
    names: rootPackageScripts,
    guard: rootPackageGuard,
  });

  const unlisted = [
    ...unlistedWorkspace.map(
      (name) => `package.json: ${name} -> rootWorkspaceScripts`,
    ),
    ...unlistedPackage.map(
      (name) => `package.json: ${name} -> rootPackageScripts`,
    ),
  ] as const;

  const isReportedAsUnlisted = (name: string): boolean =>
    unlistedWorkspace.includes(name) || unlistedPackage.includes(name);

  const offenders = [
    ...findUnguardedScripts({
      scripts: rootScripts,
      names: rootWorkspaceScripts,
      guard: rootWorkspaceGuard,
    })
      .filter((name) => !isReportedAsUnlisted(name))
      .map((name) => `package.json: ${name}`),
    ...findUnguardedScripts({
      scripts: rootScripts,
      names: rootPackageScripts,
      guard: rootPackageGuard,
    })
      .filter((name) => !isReportedAsUnlisted(name))
      .map((name) => `package.json: ${name}`),
    ...memberOffenders.flat(),
  ] as const;

  const unlistedMessage = Arr.isNonEmpty(unlisted)
    ? [
        `❌ ${unlisted.length} root script(s) start with the build-output guard but are not in the list for that form of it in \`check-deps-built-guard.mts\`:`,
        '',
        ...unlisted.map((entry) => `  ${entry}`),
        '',
        'Move each into the list named beside it, so that dropping the guard',
        'from it fails here.',
      ].join('\n')
    : undefined;

  const offendersMessage = Arr.isNonEmpty(offenders)
    ? [
        `❌ ${offenders.length} script(s) do not start with the build-output guard:`,
        '',
        ...offenders.map((offender) => `  ${offender}`),
        '',
        'Prefix each with `node <path to>/tools/scripts/cmd/assert-deps-built.mts && `',
        '(`--workspace` for a root script that runs across the members), as',
        'its siblings are.',
      ].join('\n')
    : undefined;

  const messages = [unlistedMessage, offendersMessage].filter(isString);

  return Arr.isNonEmpty(messages)
    ? Result.err(messages.join('\n\n'))
    : Result.ok(members.length);
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
      hasKey(scripts, name) && !startsWithGuard(scripts[name] ?? '', guard),
  );

/**
 * The names in `scripts` whose script starts with `guard &&` but which `names`
 * does not list.
 */
export const findUnlistedGuardedScripts = ({
  scripts,
  names,
  guard,
}: Readonly<{
  scripts: ReadonlyRecord<string, string>;
  names: readonly string[];
  guard: string;
}>): readonly string[] =>
  Object.entries(scripts)
    .filter(
      ([name, script]) =>
        startsWithGuard(script, guard) && !names.includes(name),
    )
    .map(([name]) => name);

/** Whether `script` runs `guard` first, before anything else. */
const startsWithGuard = (script: string, guard: string): boolean =>
  script.startsWith(`${guard} && `);

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
  'check:test:rules',
] as const;

/**
 * Root scripts that run a member script, or compile the members, across the
 * workspace.
 */
const rootWorkspaceScripts = [
  'check:root:dist-lib-replacement',
  'ws:check:types',
  'ws:check:types:shard-1',
  'ws:check:types:shard-2',
  'ws:check:lint',
  'ws:fix:lint',
  'ws:fix:lint:shard-1',
  'ws:fix:lint:shard-2',
  'ws:fix:lint:shard-3',
  'ws:check:test',
  'ws:check:test:browser',
  'ws:check:test:cov:run',
  'ws:check:test:cov:shard-1',
  'ws:check:test:cov:shard-2',
  'ws:check:test:cov:shard-3',
  'ws:check:test:shard-1',
  'ws:check:test:shard-2',
  'ws:check:test:rules',
  'ws:check:e2e',
  'ws:check:e2e:emulators',
  'ws:check:e2e:shard-1',
  'ws:check:e2e:shard-2',
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
