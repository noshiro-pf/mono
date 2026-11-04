import * as path from 'node:path';
import { isRecord, Arr, hasKey } from 'ts-data-forge';
import {
  getWorkspacePackages,
  runCmdInStagesAcrossWorkspaces,
  type DependencyField,
} from 'ts-repo-utils';
import { workspaceRootPath } from './project-root-path.mjs';

/**
 * Runs `cmd` in every `strict-lib/vX.Y` harness, and in nothing else.
 *
 * The stage runner alone would run `cmd` in every workspace member that defines
 * it, so a script name another member shares — `gen`, which every app and
 * library has — would run there instead and exit 0. The runner is therefore
 * limited to the harnesses, and it fails when none of them defines `cmd`, or
 * only some do, rather than reporting success for a generator that never ran.
 */
export const runInHarnesses = async ({
  cmd,
  defaultConcurrency,
}: Readonly<{
  cmd: string;
  defaultConcurrency: number;
}>): Promise<void> => {
  const packages = await getWorkspacePackages(
    workspaceRootPath,
    dependencyFields,
  );

  // By directory rather than by name, so that a harness named unlike the others
  // is still run rather than left out.
  const harnesses = packages.filter((pkg) => isHarnessDir(pkg.path));

  const harnessNames = new Set(harnesses.map((pkg) => pkg.name));

  const missing = harnesses
    .filter((pkg) => !definesScript(pkg.packageJson, cmd))
    .map((pkg) => pkg.name);

  if (Arr.isEmpty(harnesses) || Arr.isNonEmpty(missing)) {
    console.error(
      Arr.isEmpty(harnesses)
        ? `No strict-lib harness (strict-lib/vX.Y) was found under ${workspaceRootPath}.`
        : `These strict-lib harnesses define no \`${cmd}\` script, so they would not be regenerated: ${missing.join(', ')}`,
    );

    process.exit(1);
  }

  await runCmdInStagesAcrossWorkspaces({
    cmd,
    concurrency: concurrencyFromEnv(defaultConcurrency),
    rootPackageJsonDir: workspaceRootPath,
    filterWorkspacePattern: (name) => harnessNames.has(name),
    dependencyFields,
  });
};

// Same reason as `ws:build`: the workspace's devDependencies are cyclic (the
// toolchain packages depend on each other), so ordering by them leaves no valid
// stage order at all.
//
// Nothing here needs ordering. The harnesses are independent of one another,
// and `strict-ts-lib-scripts-common` — which they all import — is not a harness
// and never appears in a stage. Every harness lands in stage one. This option
// is set only to keep the cyclic devDependencies out of the graph.
const dependencyFields = [
  'dependencies',
  'peerDependencies',
] as const satisfies readonly DependencyField[];

const isHarnessDir = (packagePath: string): boolean =>
  /^strict-lib[/\\]v\d+\.\d+$/u.test(
    path.relative(workspaceRootPath, packagePath),
  );

const definesScript = (packageJson: unknown, cmd: string): boolean =>
  isRecord(packageJson) &&
  isRecord(packageJson['scripts']) &&
  hasKey(packageJson['scripts'], cmd);

const concurrencyFromEnv = (defaultConcurrency: number): number => {
  const parsed = Number(process.env['WS_GEN_CONCURRENCY']);

  return Number.isSafeInteger(parsed) && parsed > 0
    ? parsed
    : defaultConcurrency;
};
