import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import {
  Arr,
  hasKey,
  isNotUndefined,
  isRecord,
  isString,
  Json,
  Result,
  unknownToString,
} from 'ts-data-forge';
import { $, isDirectlyExecuted } from 'ts-repo-utils';
import { projectRootPath } from '../project-root-path.mjs';

/**
 * Spell-checks `.changeset/` under the configuration that will apply to the
 * text once it is released.
 *
 * A changeset's body is copied verbatim into the `CHANGELOG.md` of every
 * package its front matter names, and each of those changelogs is checked
 * under the configuration cspell finds by walking up from that package's
 * directory. The changeset file itself sits at the repository root, where
 * only the root configuration applies — so a word a package's own
 * `cspell.config.yaml` allows fails while the changeset exists, and a word
 * only the root allows passes there and fails once released. Neither is the
 * question worth asking; what matters is the destination.
 *
 * So each changeset is checked once per named package, under that package's
 * configuration, and has to pass under **all** of them: the one body reaches
 * every named package's changelog, so a word is only safe if every one of
 * those configurations accepts it.
 *
 * Everything else in the directory — `README.md`, `config.json`, a `pre.json`
 * during a pre-release — has no destination and is checked under the root
 * configuration, which is where the repository-wide pass would have taken it.
 */
export const cspellChangeset = async (): Promise<Result<number, string>> => {
  const changesetDir = path.resolve(projectRootPath, CHANGESET_DIR_NAME);

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const listing = fs.readdir(changesetDir, {
    recursive: true,
    withFileTypes: true,
  });

  const entries = await listing.catch(() => undefined);

  if (entries === undefined) {
    return Result.err(`${CHANGESET_DIR_NAME}/ does not exist.`);
  }

  const files = entries
    .filter((entry) => entry.isFile())
    .map((entry) => path.resolve(entry.parentPath, entry.name));

  if (!Arr.isNonEmpty(files)) {
    return Result.ok(0);
  }

  const packageDirs = await getWorkspacePackageDirs();

  if (Result.isErr(packageDirs)) return packageDirs;

  const plans = await Promise.all(
    files.map(async (file) => planFor(file, packageDirs.value)),
  );

  const unknown = plans.flatMap(({ file, unknownPackages }) =>
    unknownPackages.map(
      (name) =>
        `${path.relative(projectRootPath, file)}: no workspace package named "${name}".`,
    ),
  );

  if (Arr.isNonEmpty(unknown)) {
    return Result.err(
      [
        'A changeset names a package that does not exist. `changeset version`',
        'would fail on it, and until then it releases nothing.',
        '',
        ...unknown,
      ].join('\n'),
    );
  }

  // One cspell run per distinct configuration, over every file that has to
  // pass under it. A changeset naming several packages appears in several
  // groups, which is what makes "all of them" the condition.
  //
  // Sequentially, so that each report follows the command line naming the
  // configuration it came from. Run concurrently they interleave, and with
  // one report per configuration there is nothing left to tell them apart.
  const failed = await Arr.uniq(plans.flatMap(({ configs }) => configs)).reduce<
    Promise<readonly string[]>
  >(async (accPromise, config) => {
    const acc = await accPromise;

    const failure = await runCspell(
      config,
      plans
        .filter((plan) => plan.configs.includes(config))
        .map(({ file }) => file),
    );

    return failure === undefined ? acc : Arr.toPushed(acc, failure);
  }, Promise.resolve([]));

  return Arr.isNonEmpty(failed)
    ? Result.err(
        [
          'Spelling issues in .changeset/. Each file was checked under the',
          'configuration of every package its front matter names, because that',
          'is what will check the text once it reaches those CHANGELOG.md.',
          '',
          ...failed,
        ].join('\n'),
      )
    : Result.ok(files.length);
};

/** What one file in `.changeset/` has to be checked under. */
type Plan = Readonly<{
  file: string;
  /** Absolute paths of the cspell configurations that must all accept it. */
  configs: readonly string[];
  /** Front-matter names that match no workspace package. */
  unknownPackages: readonly string[];
}>;

const CHANGESET_DIR_NAME = '.changeset';

const ROOT_CSPELL_CONFIG = path.resolve(projectRootPath, '.cspell.config.yaml');

/**
 * The configuration filenames cspell looks for in a directory, in its own
 * order of preference. Taken from cspell-lib's `searchPlaces`, minus the
 * `.vscode/` and `.config/` locations and the JavaScript ones, none of which
 * this repository uses. A package that grows one of these instead of the
 * `cspell.config.yaml` everything uses today still resolves correctly.
 */
const CSPELL_CONFIG_FILENAMES = [
  '.cspell.json',
  'cspell.json',
  '.cspell.jsonc',
  'cspell.jsonc',
  '.cspell.config.json',
  '.cspell.config.jsonc',
  '.cspell.config.yaml',
  '.cspell.config.yml',
  'cspell.config.json',
  'cspell.config.jsonc',
  'cspell.config.yaml',
  'cspell.config.yml',
  '.cspell.yaml',
  '.cspell.yml',
  'cspell.yaml',
  'cspell.yml',
] as const;

/** Matches `'pkg': patch`, `"pkg": minor` or `pkg: major`. */
const FRONT_MATTER_ENTRY =
  /^\s*['"]?(.+?)['"]?\s*:\s*(?:major|minor|patch)\s*$/u;

/** Runs cspell over `files` with `config`, returning its report when it fails. */
const runCspell = async (
  config: string,
  files: readonly string[],
): Promise<string | undefined> => {
  const relative = (p: string): string =>
    JSON.stringify(path.relative(projectRootPath, p));

  const result = await $(
    [
      'pnpm exec cspell',
      '--no-progress',
      `--config ${relative(config)}`,
      ...files.map(relative),
    ].join(' '),
    { cwd: projectRootPath },
  );

  return Result.isErr(result)
    ? Arr.toUnshifted(`  under ${path.relative(projectRootPath, config)}:`)(
        files.map((file) => `    ${path.relative(projectRootPath, file)}`),
      ).join('\n')
    : undefined;
};

/** Decides which configurations one file has to pass under. */
const planFor = async (
  file: string,
  packageDirs: ReadonlyMap<string, string>,
): Promise<Plan> => {
  const names = await readChangesetPackageNames(file);

  if (!Arr.isNonEmpty(names)) {
    return { file, configs: [ROOT_CSPELL_CONFIG], unknownPackages: [] };
  }

  const dirs = names.map((name) => packageDirs.get(name));

  const configs = await Promise.all(
    dirs.filter(isNotUndefined).map(async (dir) => findCspellConfig(dir)),
  );

  return {
    file,
    configs: Arr.uniq(configs),
    unknownPackages: names.filter((name) => !packageDirs.has(name)),
  };
};

/**
 * The package names in a changeset's front matter, or none when the file has
 * no front matter — `README.md` and `config.json` land here.
 */
const readChangesetPackageNames = async (
  file: string,
): Promise<readonly string[]> => {
  if (path.extname(file) !== '.md') return [];

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const content = await fs.readFile(file, 'utf8');

  const lines = content.split('\n');

  if (lines[0]?.trim() !== '---') return [];

  const end = lines.findIndex(
    (line, index) => index > 0 && line.trim() === '---',
  );

  if (end === -1) return [];

  return lines
    .slice(1, end)
    .map((line) => FRONT_MATTER_ENTRY.exec(line)?.[1])
    .filter(isString);
};

/**
 * The configuration cspell would use for a file in `packageDir`: the nearest
 * one at or above it, stopping at the repository root. This mirrors cspell's
 * own upward search, which is what makes the answer here the same one the
 * `CHANGELOG.md` in that directory will get.
 */
const findCspellConfig = async (packageDir: string): Promise<string> => {
  const candidates = ancestorsToRoot(packageDir).flatMap((dir) =>
    CSPELL_CONFIG_FILENAMES.map((name) => path.resolve(dir, name)),
  );

  const found = await Promise.all(candidates.map(fileExists));

  return (
    candidates.find((_, index) => found[index] === true) ?? ROOT_CSPELL_CONFIG
  );
};

/** `dir` and every directory above it, up to and including the repository root. */
const ancestorsToRoot = (dir: string): readonly string[] => {
  const relative = path.relative(projectRootPath, dir);

  if (
    relative === '' ||
    relative.startsWith('..') ||
    path.isAbsolute(relative)
  ) {
    return [projectRootPath];
  }

  const segments = relative.split(path.sep);

  return Arr.toPushed(
    segments.map((_, index) =>
      path.resolve(
        projectRootPath,
        ...segments.slice(0, segments.length - index),
      ),
    ),
    projectRootPath,
  );
};

/** Every workspace package, by name, mapped to its directory. */
const getWorkspacePackageDirs = async (): Promise<
  Result<ReadonlyMap<string, string>, string>
> => {
  // pnpm rather than the root `package.json` `workspaces` field, which is the
  // stale one: it predates `languages/*/*`. `privatePackages.version` is true
  // in `.changeset/config.json`, so a private package gets a CHANGELOG.md too
  // and has to resolve here like any other.
  const result = await $('pnpm ls --recursive --depth -1 --json', {
    cwd: projectRootPath,
    silent: true,
  });

  if (Result.isErr(result)) {
    return Result.err(`\`pnpm ls\` failed: ${result.value.message}`);
  }

  const parsed = Json.parse(result.value.stdout);

  if (Result.isErr(parsed)) {
    return Result.err(`\`pnpm ls\` returned no JSON: ${parsed.value}`);
  }

  const projects = parsed.value;

  if (!Arr.isArray(projects)) {
    return Result.err('`pnpm ls` returned something other than an array.');
  }

  return Result.ok(
    new Map(
      projects
        .map((project) =>
          isRecord(project) &&
          hasKey(project, 'name') &&
          isString(project.name) &&
          hasKey(project, 'path') &&
          isString(project.path)
            ? ([project.name, project.path] as const)
            : undefined,
        )
        .filter(isNotUndefined),
    ),
  );
};

const fileExists = async (filePath: string): Promise<boolean> => {
  // Not `.then(onOk, onErr)`: eslint --fix rewrites that pair into
  // `.catch(() => false).then(() => true)`, which answers true for every
  // path and silently resolves every package to the first candidate.
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const stats = await fs.stat(filePath).catch(() => undefined);

  return stats !== undefined;
};

if (isDirectlyExecuted(import.meta.url)) {
  const result = await cspellChangeset().catch((error: unknown) =>
    Result.err(unknownToString(error)),
  );

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(
    `CSpell: ${result.value} file(s) in ${CHANGESET_DIR_NAME}/ checked against their packages' configs.`,
  );
}
