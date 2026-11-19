import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import {
  Arr,
  asUint32,
  isRecord,
  isString,
  Result,
  unknownToString,
} from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import { pagesAstroSites } from '../../configs/pages-apps.mjs';
import { describeFailure, runFile } from '../lib/child-process.mjs';
import { plural } from '../lib/plural.mjs';
import { listTrackedFiles, readRepositoryFile } from '../lib/repo-files.mjs';
import { parseWorkflow, readWorkflowJobs } from '../lib/workflow-jobs.mjs';
import { projectRootPath } from '../project-root-path.mjs';
import { isInScope, SCOPE_PATTERN } from './check-mono-links.mjs';

/**
 * Holds `link-check.yml` to `SCOPE_PATTERN` in `check-mono-links.mts`, the one
 * statement of which files' links are this repository's to check.
 *
 * The workflow writes that scope twice more, in syntaxes of their own: the
 * pathspecs of its "List the files to check" step, which say what lychee reads,
 * and its `pull_request` `paths` filter, which says when it runs. A file left
 * out of either is a dead link reported by nothing, and nothing else fails. So
 * the step is run (see {@link runListStep}) and its list compared with the
 * tracked Markdown and MDX of the scope, both ways, and every file of the scope
 * has to be one a `paths` pattern takes in. The lychee step itself is not read:
 * that it is given the list (`--files-from`), and nothing else, is the
 * workflow's to keep, as its comment there says.
 *
 * The docs sites are in the scope by their directory's `-docs` suffix. Every
 * tracked one has to be a site `deploy-pages.yml` publishes
 * (`pagesAstroSites`), since a docs site's README links to its own deployed
 * URL, which answers 404 until it is published; and every published site has to
 * be in the scope, or its links are checked by nothing. Whether an entry's
 * directory exists is `check:root:astro-site-base`'s to say.
 */
export const checkLinkCheckScope = (): Promise<Result<number, string>> =>
  Result.safeTry(async function* () {
    const workflow = yield* Result.safeUnwrap(
      await readRepositoryFile(LINK_CHECK_WORKFLOW),
    );

    const tracked = yield* Result.safeUnwrap(await listTrackedFiles());

    const listed = yield* Result.safeUnwrap(await runListStep(workflow));

    const found = yield* Result.safeUnwrap(
      findLinkCheckScopeViolations({
        workflow,
        tracked,
        listed,
        publishedSites: pagesAstroSites.map((site) => site.packageDir),
      }),
    );

    return Arr.isNonEmpty(found.messages)
      ? Result.err(
          [
            `${LINK_CHECK_WORKFLOW} does not check the links of exactly the files SCOPE_PATTERN in tools/scripts/cmd/check-mono-links.mts names:`,
            '',
            ...found.messages,
          ].join('\n'),
        )
      : Result.ok(found.checked);
  });

/**
 * What is wrong with the workflow's scope, one message each, and how many files
 * the scope holds: its list and its `paths` filter against the scope, and every
 * tracked docs site against `publishedSites` (`pagesAstroSites`), and every
 * entry of that against the scope. `listed` is what the workflow's list step
 * printed. A workflow that does not parse, or has no `pull_request` `paths`
 * filter, is an error rather than a message: the comparison would then read
 * nothing.
 */
export const findLinkCheckScopeViolations = ({
  workflow,
  tracked,
  listed,
  publishedSites,
}: Readonly<{
  workflow: string;
  tracked: readonly string[];
  listed: readonly string[];
  publishedSites: readonly string[];
}>): Result<
  Readonly<{ checked: number; messages: readonly string[] }>,
  string
> =>
  Result.map(readPathsFilter(workflow), (patterns) => {
    const inScope = tracked.filter(isLinkChecked);

    const listedSet = new Set(listed);

    const inScopeSet = new Set(inScope);

    const apps = Arr.uniq(
      Arr.generate(function* () {
        for (const file of tracked) {
          const app = APP_DIRECTORY.exec(file)?.groups?.['app'];

          if (app !== undefined) {
            yield app;
          }
        }
      }),
    ).toSorted();

    const docsSites = apps.filter((app) => SCOPE_PATTERN.test(`apps/${app}/`));

    const unread = patterns.filter(
      (pattern) => pattern.startsWith('!') || UNREAD_SYNTAX.test(pattern),
    );

    return {
      checked: inScope.length,
      messages: [
        ...inScope
          .filter((file) => !listedSet.has(file))
          .map(
            (file) =>
              `${file}: in SCOPE_PATTERN, but the "${LIST_STEP}" step of ${LINK_CHECK_WORKFLOW} does not list it, so lychee never reads it.`,
          ),
        ...listed
          .filter((file) => !inScopeSet.has(file))
          .map(
            (file) =>
              `${file}: listed by the "${LIST_STEP}" step of ${LINK_CHECK_WORKFLOW}, but not tracked Markdown or MDX in SCOPE_PATTERN.`,
          ),
        ...unread.map(
          (pattern) =>
            String.raw`${LINK_CHECK_WORKFLOW}: the paths filter's pattern '${pattern}' uses syntax this check does not read (a leading !, or ? + [ ] \); state the scope with * and ** alone.`,
        ),
        ...inScope
          .filter((file) =>
            patterns.every((pattern) => !matchesPathsFilterGlob(pattern, file)),
          )
          .map(
            (file) =>
              `${file}: in SCOPE_PATTERN, but no pattern of the paths filter of ${LINK_CHECK_WORKFLOW} takes it in, so a pull request changing it does not run the workflow.`,
          ),
        ...docsSites
          .filter((site) => !publishedSites.includes(site))
          .map(
            (site) =>
              `apps/${site}: a docs site in SCOPE_PATTERN that deploy-pages.yml does not publish; add it to pagesAstroSites in tools/configs/pages-apps.mts (a docs site is one of the Astro sites published there).`,
          ),
        ...publishedSites
          .filter((site) => !SCOPE_PATTERN.test(`apps/${site}/`))
          .map(
            (site) =>
              `apps/${site}: published by deploy-pages.yml as a docs site, but outside SCOPE_PATTERN, so its links are checked by nothing; name its directory with a -docs suffix.`,
          ),
      ],
    };
  });

/**
 * Whether `glob`, a pattern of a workflow's `paths` filter, takes in `file`, as
 * GitHub matches one: `**` matches any characters, a slash included, a whole
 * `**\/` segment also no directory at all, and `*` any characters but a slash.
 * A dot is matched like any other character. The rest of GitHub's syntax (`?`,
 * `+`, `[…]`, `\`, a leading `!`) is not read;
 * {@link findLinkCheckScopeViolations} refuses a pattern that uses it.
 */
export const matchesPathsFilterGlob = (glob: string, file: string): boolean => {
  // `**/**/` matches what one `**/` does, and the rule above reads one.
  const single = glob.replaceAll(/(?:\*\*\/){2,}/gu, '**/');

  return (
    (single.startsWith('**/') && matchesFrom(single.slice(3), file)) ||
    matchesFrom(single, file)
  );
};

/**
 * Runs the workflow's list step and reads the file it writes, with
 * `RUNNER_TEMP` a directory of its own. The step is run with `bash -e` at the
 * repository root, as GitHub runs a `run:` step with no `shell:` on a Linux
 * runner (`runs-on` is not read: the job is `ubuntu-latest`), in the caller's
 * environment save `BASH_ENV` and `ENV`, which bash would source first; the
 * caller's git variables are kept, so that the step reads the same index as
 * {@link listTrackedFiles}.
 *
 * This is the step's list, not a reproduction of the runner. The keys of the
 * step and its job that are known to change how or whether it runs are refused
 * rather than imitated: a `shell:`, a `working-directory:`, an `if:` on either,
 * a `container:`, an `env:` at any level, a `${{ }}` expression, or more than
 * one step of the name. The steps before it are not read: the checkout they
 * make is taken to be the repository's root, as `Checkout` with no `path:`
 * makes it.
 */
export const runListStep = async (
  workflow: string,
): Promise<Result<readonly string[], string>> => {
  const jobs = readWorkflowJobs(workflow);

  if (Result.isErr(jobs)) {
    return Result.err(`${LINK_CHECK_WORKFLOW}: ${jobs.value}`);
  }

  const found = jobs.value.flatMap((candidate) =>
    candidate.steps
      .filter(({ name }) => name === LIST_STEP)
      .map((listStep) => ({ job: candidate, step: listStep })),
  );

  if (!Arr.isFixedLengthArray(1, found)) {
    return Result.err(
      `${LINK_CHECK_WORKFLOW} has ${plural(found.length, `step named "${LIST_STEP}"`)}; this check reads exactly one.`,
    );
  }

  const [{ job, step }] = found;

  const script = step.run;

  if (script === undefined) {
    return Result.err(
      `The "${LIST_STEP}" step of ${LINK_CHECK_WORKFLOW} has no run: script.`,
    );
  }

  const notReproduced = [
    step.shell !== undefined ? 'a shell: (of the step or a defaults.run)' : '',
    step.workingDirectory !== undefined
      ? 'a working-directory: (of the step or a defaults.run)'
      : '',
    step.condition !== undefined ? 'an if: on the step' : '',
    job.condition !== undefined ? 'an if: on its job' : '',
    job.hasContainer ? 'a container: on its job' : '',
    Arr.isNonEmpty(Object.keys(job.env))
      ? 'an env: on its job or the workflow'
      : '',
    Arr.isNonEmpty(Object.keys(step.env)) ? 'an env: on the step' : '',
    // eslint-disable-next-line no-template-curly-in-string -- GitHub's expression syntax, not a template
    script.includes('${{') ? 'a ${{ }} expression in its script' : '',
  ].filter((key) => key !== '');

  if (Arr.isNonEmpty(notReproduced)) {
    return Result.err(
      `The "${LIST_STEP}" step of ${LINK_CHECK_WORKFLOW} has ${notReproduced.join(', ')}, which this check does not reproduce; keep it a bash script that reads the tree alone.`,
    );
  }

  const runnerTemp = await fs.mkdtemp(
    path.join(os.tmpdir(), 'check-link-check-scope-'),
  );

  try {
    const { BASH_ENV: _bashEnv, ENV: _env, ...callerEnv } = process.env;

    const result = await runFile('bash', ['-e', '-c', script], {
      cwd: projectRootPath,
      env: { ...callerEnv, RUNNER_TEMP: runnerTemp },
    });

    if (result.status !== 0) {
      return Result.err(
        `The "${LIST_STEP}" step of ${LINK_CHECK_WORKFLOW} failed: ${describeFailure(result)}`,
      );
    }

    const listing = await Result.fromPromise(
      // eslint-disable-next-line security/detect-non-literal-fs-filename -- a file under the directory made above
      fs.readFile(path.join(runnerTemp, LIST_FILE), 'utf8'),
    );

    return Result.isErr(listing)
      ? Result.err(
          `The "${LIST_STEP}" step of ${LINK_CHECK_WORKFLOW} wrote no ${LIST_FILE}: ${unknownToString(listing.value)}`,
        )
      : Result.ok(listing.value.split('\n').filter((line) => line !== ''));
  } finally {
    await fs.rm(runnerTemp, { recursive: true, force: true });
  }
};

const LINK_CHECK_WORKFLOW = '.github/workflows/link-check.yml';

const LIST_STEP = 'List the files to check';

/** The file the list step writes, under `RUNNER_TEMP`. */
const LIST_FILE = 'link-check-files.txt';

/** What {@link matchesPathsFilterGlob} does not read in a pattern. */
const UNREAD_SYNTAX = /[?+[\]\\]/u;

/** The directory under `apps/` a path is in. */
const APP_DIRECTORY = /^apps\/(?<app>[^/]+)\//u;

const isLinkChecked = (relativePath: string): boolean =>
  isInScope(relativePath) &&
  ['.md', '.mdx'].includes(path.posix.extname(relativePath));

/** The patterns of the workflow's `on.pull_request.paths`, as written. */
const readPathsFilter = (workflow: string): Result<readonly string[], string> =>
  Result.flatMap(
    parseWorkflow(workflow),
    (parsed): Result<readonly string[], string> => {
      const on = isRecord(parsed) ? parsed['on'] : undefined;

      const pullRequest = isRecord(on) ? on['pull_request'] : undefined;

      const paths = isRecord(pullRequest) ? pullRequest['paths'] : undefined;

      const patterns = Arr.isArray(paths)
        ? paths.filter(isString)
        : ([] as const);

      return Arr.isArray(paths) &&
        Arr.isNonEmpty(patterns) &&
        patterns.length === paths.length
        ? Result.ok(patterns)
        : Result.err(
            `${LINK_CHECK_WORKFLOW} has no on.pull_request.paths list of strings to read.`,
          );
    },
  );

/**
 * {@link matchesPathsFilterGlob} past the start of the pattern, where a `**\/`
 * matches no directory only as a whole segment, after a slash.
 */
const matchesFrom = (glob: string, file: string): boolean => {
  if (
    glob.startsWith('/**/') &&
    file.startsWith('/') &&
    matchesFrom(glob.slice(3), file)
  ) {
    return true;
  }

  if (glob.startsWith('**')) {
    const rest = glob.slice(2);

    return Arr.seq(asUint32(file.length + 1)).some((index) =>
      matchesFrom(rest, file.slice(index)),
    );
  }

  if (glob.startsWith('*')) {
    const rest = glob.slice(1);

    const slash = file.indexOf('/');

    const longest = slash === -1 ? file.length : slash;

    return Arr.seq(asUint32(longest + 1)).some((index) =>
      matchesFrom(rest, file.slice(index)),
    );
  }

  return glob === ''
    ? file === ''
    : file.at(0) === glob.at(0) && matchesFrom(glob.slice(1), file.slice(1));
};

if (isDirectlyExecuted(import.meta.url)) {
  const result = await checkLinkCheckScope().catch((error: unknown) =>
    Result.err(unknownToString(error)),
  );

  if (Result.isErr(result)) {
    console.error(`❌ ${result.value}`);

    process.exit(1);
  }

  console.info(
    `${LINK_CHECK_WORKFLOW} lists the ${plural(result.value, 'Markdown or MDX file')} of SCOPE_PATTERN and runs on a change to each; every docs site is published, and every published one is in it.`,
  );
}
