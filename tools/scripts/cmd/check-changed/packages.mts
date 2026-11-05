import * as path from 'node:path';
import { Arr, isRecord, isString, Result } from 'ts-data-forge';
import { getWorkspacePackages } from 'ts-repo-utils';
import { projectRootPath } from '../../project-root-path.mjs';
import { readGateList } from '../workflow-steps.mjs';
import { readManifestDependencies, type PackageInfo } from './plan.mjs';

/** The workspace members, as `plan.mts` reads them. */
export const readPackages = async (): Promise<readonly PackageInfo[]> => {
  const workspace = await getWorkspacePackages(projectRootPath);

  return workspace.map((pkg) => ({
    name: pkg.name,
    dir: path.relative(projectRootPath, pkg.path).split(path.sep).join('/'),
    scripts: new Set(scriptsOf(pkg.packageJson).keys()),
    isPrivate: isRecord(pkg.packageJson) && pkg.packageJson['private'] === true,
    ...readManifestDependencies(pkg.packageJson),
  }));
};

/** A manifest's string-valued `scripts`, by name. */
export const scriptsOf = (manifest: unknown): ReadonlyMap<string, string> => {
  const scripts =
    isRecord(manifest) && isRecord(manifest['scripts'])
      ? manifest['scripts']
      : ({} as const);

  return new Map(
    Arr.generate(function* () {
      for (const [name, command] of Object.entries(scripts)) {
        if (isString(command)) {
          yield [name, command] as const;
        }
      }
    }),
  );
};

/**
 * The paths the code gate ignores, from the list `code-check.yml`'s gate reads
 * (`tools/configs/gate-ignore-lists.json`), so that what check-changed calls
 * prose is what CI skips.
 */
export const readProseGate = (): Result<readonly string[], string> => {
  const patterns = readGateList('code', projectRootPath);

  return patterns.ok ? Result.ok(patterns.value) : Result.err(patterns.message);
};
