import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr, isRecord, isString } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import { type ReadonlyRecord } from 'ts-type-forge';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Writes the changeset that `pnpm-update.yml` needs, when the update moved
 * something a consumer can observe.
 *
 * A dependency bump publishes nothing on its own — changesets decide releases
 * here (see CLAUDE.md, "Releases") — so a run that moved a published package's
 * *runtime* dependencies has to say so, or the fix ships to nobody. What
 * counts as runtime is `dependencies`, `peerDependencies` and
 * `optionalDependencies`: those three are what a consumer installs.
 * `devDependencies` moving is invisible to them.
 *
 * ## Why this is a step of its own, before the token
 *
 * It used to be a `node <<'NODE'` heredoc inside the workflow's last step,
 * which is the step that holds the GitHub App token. Length was not the
 * problem — the problem is that everything in that step runs with the token in
 * its environment, so the less that happens there the better, and none of this
 * needs the token. Reading `package.json` files and writing a changeset is
 * exactly the work that belongs before it.
 *
 * That it can be a file at all follows from the same ordering: a script in the
 * working tree is read at the moment it is invoked, after `pnpm install` has
 * run the dependency tree's lifecycle scripts, so a dependency could rewrite
 * it. Before the token is minted that buys an attacker nothing they do not
 * already have — they are already executing code in this job. After it, it
 * would buy them the token. See "An inline `run:` block in a privileged job"
 * in CLAUDE.md.
 *
 * ## The baseline
 *
 * `HEAD` is still the pre-update commit when this runs: the workflow does not
 * commit until afterwards. So the comparison is each manifest against
 * `git show HEAD:<file>` — not against a stored copy, which would be one more
 * thing to keep in step.
 */
export const main = async (): Promise<void> => {
  const changed = await changedPublishablePackages();

  if (!Arr.isNonEmpty(changed)) {
    console.log(
      'No publishable runtime-dependency changes; no changeset added.',
    );

    return;
  }

  const file = path.resolve(
    projectRootPath,
    '.changeset',
    `pnpm-update-${todayUtc()}.md`,
  );

  // eslint-disable-next-line security/detect-non-literal-fs-filename -- a path built from the date.
  await fs.writeFile(file, renderChangeset(changed));

  console.log(`Added patch changeset for: ${changed.join(', ')}`);
};

/**
 * The body of `.changeset/pnpm-update-<date>.md`.
 *
 * The front matter names every package, and the text below it is copied into
 * each of their changelogs — see CLAUDE.md, "`.changeset/`", for why what it
 * says has to pass cspell under each named package's own config.
 */
export const renderChangeset = (packageNames: readonly string[]): string =>
  [
    '---',
    ...packageNames.map((name) => `'${name}': patch`),
    '---',
    '',
    'Update dependencies',
    '',
  ].join('\n');

/**
 * Whether a consumer of this package would see the update.
 *
 * Compared as JSON rather than key by key: a range that changed, a dependency
 * added and one dropped are all the same answer, and the caller only needs the
 * answer.
 */
export const runtimeDependenciesChanged = (
  current: ReadonlyRecord<string, unknown>,
  baseline: ReadonlyRecord<string, unknown>,
): boolean =>
  runtimeFields.some(
    (field) =>
      JSON.stringify(current[field] ?? {}) !==
      JSON.stringify(baseline[field] ?? {}),
  );

/** What a consumer installs. `devDependencies` is deliberately not here. */
export const runtimeFields = [
  'dependencies',
  'peerDependencies',
  'optionalDependencies',
] as const;

/**
 * Whether the manifest describes something that gets published.
 *
 * `private: true` is what the ten `apps/*` packages carry; naming one in a
 * changeset fails `changeset version`.
 */
export const isPublishable = (
  manifest: ReadonlyRecord<string, unknown>,
): boolean => isString(manifest['name']) && manifest['private'] !== true;

const changedPublishablePackages = async (): Promise<readonly string[]> => {
  const manifests = await workspaceManifests();

  const mut_changed: string[] = [];

  for (const { relativePath, manifest } of manifests) {
    if (!isPublishable(manifest)) {
      continue;
    }

    const name = manifest['name'];

    if (
      isString(name) &&
      runtimeDependenciesChanged(manifest, baselineManifest(relativePath))
    ) {
      mut_changed.push(name);
    }
  }

  return mut_changed.toSorted((a, b) => a.localeCompare(b));
};

/**
 * `libs/*` and `apps/*` only.
 *
 * Not every workspace glob: the generated bundles under `strict-lib` are
 * written by `strict-lib:gen:packages` and excluded from `update-packages` for
 * that reason (CLAUDE.md, "Dependencies"), and `tools` publishes nothing.
 */
const workspaceManifests = async (): Promise<
  readonly Readonly<{
    relativePath: string;
    manifest: ReadonlyRecord<string, unknown>;
  }>[]
> => {
  const mut_found: {
    relativePath: string;
    manifest: ReadonlyRecord<string, unknown>;
  }[] = [];

  for (const group of ['libs', 'apps']) {
    const groupPath = path.resolve(projectRootPath, group);

    // eslint-disable-next-line security/detect-non-literal-fs-filename -- a literal group name.
    const entries = await fs.readdir(groupPath, { withFileTypes: true });

    const directories = entries.filter((d) => d.isDirectory());

    for (const entry of directories) {
      const relativePath = path.posix.join(group, entry.name, 'package.json');

      const parsed = await readJsonIfPresent(
        path.resolve(projectRootPath, relativePath),
      );

      if (parsed !== undefined) {
        mut_found.push({ relativePath, manifest: parsed });
      }
    }
  }

  return mut_found;
};

const readJsonIfPresent = async (
  file: string,
): Promise<ReadonlyRecord<string, unknown> | undefined> => {
  try {
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- a package.json under a workspace glob.
    const text = await fs.readFile(file, 'utf8');

    const parsed: unknown = JSON.parse(text);

    return isRecord(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
};

/**
 * The manifest as `HEAD` has it, or `{}` for a package this update added.
 *
 * `execFileSync` rather than a shell, so a path is an argument and never part
 * of a command line.
 */
const baselineManifest = (
  relativePath: string,
): ReadonlyRecord<string, unknown> => {
  try {
    const text = execFileSync('git', ['show', `HEAD:${relativePath}`], {
      cwd: projectRootPath,
      encoding: 'utf8',
    });

    const parsed: unknown = JSON.parse(text);

    return isRecord(parsed) ? parsed : {};
  } catch {
    return {};
  }
};

/**
 * `YYYYMMDD` in UTC, for the changeset's file name.
 *
 * UTC rather than the runner's clock so that the name a scheduled run picks
 * does not depend on where it ran — the job fires at 21:07 UTC, which is the
 * next day in JST.
 */
const todayUtc = (): string =>
  Temporal.Now.plainDateISO('UTC').toString().replaceAll('-', '');

if (isDirectlyExecuted(import.meta.url)) {
  await main();
}
