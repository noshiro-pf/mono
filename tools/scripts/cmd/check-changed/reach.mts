import { Arr, Result } from 'ts-data-forge';
import {
  reachableFrom,
  resolveScriptInvocations,
  splitCommandId,
  toCommandId,
  type CommandId,
  type CoverageGraph,
  type Manifest,
} from '../check-ci-commands.mjs';
import type { Step } from './plan.mjs';

/**
 * What a `check-changed` plan runs, in the terms `check-ci-commands.mts` reads
 * the workflows in: a `<directory>:<script>` per script, so that the two can be
 * compared. `check-changed-reach.mts` asks whether every command CI runs is one
 * some diff makes `check-changed` run, or is declared {@link CI_ONLY}.
 */

/**
 * The scripts a step runs. A `pnpm run` with arguments runs the script it
 * names; `run-p` runs each script it lists; the cspell over the changed files
 * runs no script (it is `check:cspell` narrowed to them, and a change to a
 * cspell config runs `check:cspell` itself). Any other form is an error, so
 * that a new kind of step is taught here rather than silently reaching nothing.
 */
export const stepCommands = (
  step: Step,
): Result<readonly CommandId[], string> => {
  const [verb, program, ...rest] = step.args;

  if (verb === 'run' && program !== undefined) {
    return Result.ok(
      Arr.toUnshifted(toCommandId(step.cwd, program))(
        program === 'check:test' && step.coverage !== undefined
          ? [toCommandId(step.cwd, 'check:test:cov')]
          : [],
      ),
    );
  }

  if (verb === 'exec' && program === 'run-p') {
    return Result.ok(
      rest
        .filter((token) => !token.startsWith('-'))
        .map((script) => toCommandId(step.cwd, script)),
    );
  }

  if (verb === 'exec' && program === 'cspell') {
    return Result.ok([]);
  }

  return Result.err(
    `check-changed's step "${step.title}" (pnpm ${Arr.take(step.args, 2).join(' ')}) is a form stepCommands does not know; teach it which scripts the step runs.`,
  );
};

/**
 * The commands CI's entry points reach that a set of locally run commands does
 * not cover, each with the first entry point that reaches it.
 *
 * An aggregate (a body that runs other scripts and nothing else) is not judged
 * itself; what it reaches is. So `check:root` asks for each `check:root:*`, and
 * `ws:fix:lint:apps` for each app's `fix:lint`, while a script that does work
 * of its own (`fix:codemod:affected` decides the codemod's scope before it runs
 * it) has to be reached by the local commands itself.
 */
export const findUncovered = ({
  graph,
  manifests,
  ciEntries,
  localReach,
}: Readonly<{
  graph: CoverageGraph;
  manifests: readonly Manifest[];
  ciEntries: readonly Readonly<{ origin: string; command: CommandId }>[];
  /** What the local commands reach, through the same graph. */
  localReach: ReadonlySet<CommandId>;
}>): readonly Uncovered[] => {
  const bodies = new Map(
    manifests.flatMap(({ directory, scripts }) =>
      Object.entries(scripts).map(
        ([scriptName, body]) =>
          [toCommandId(directory, scriptName), body] as const,
      ),
    ),
  );

  const mut_found = new Map<CommandId, string>();

  for (const { origin, command: entry } of ciEntries) {
    for (const command of reachableFrom(graph, [entry])) {
      const body = bodies.get(command);

      if (
        body === undefined ||
        isAggregate(body) ||
        localReach.has(command) ||
        mut_found.has(command)
      ) {
        continue;
      }

      mut_found.set(command, origin);
    }
  }

  return Array.from(mut_found, ([command, origin]) => ({
    command,
    origin,
  })).toSorted((a, b) => a.command.localeCompare(b.command));
};

/** Whether a {@link CI_ONLY} entry names a command. */
export const matchesCiOnly = (entry: CiOnly, command: CommandId): boolean => {
  const { directory, scriptName } = splitCommandId(command);

  return (
    entry.scriptName === scriptName &&
    (entry.directory === undefined ||
      entry.directory === directory ||
      (entry.directory.endsWith('/') && directory.startsWith(entry.directory)))
  );
};

/**
 * The {@link CI_ONLY} entry that applies to a command: of those that name it,
 * the one naming its directory, then the one naming the longest directory it is
 * under, then the one naming no directory. So a directory-scoped entry stands
 * in for a global one there — for a package whose `doc` writes nothing
 * committed, say, which the global `doc` entry's `writtenBy` would hold to
 * generators it does not have.
 */
export const applicableCiOnly = (
  ciOnly: readonly CiOnly[],
  command: CommandId,
): CiOnly | undefined =>
  ciOnly
    .filter((entry) => matchesCiOnly(entry, command))
    .toSorted((a, b) => specificity(b) - specificity(a))
    .at(0);

/** The commands by script name, in the order first seen. */
export const groupByScript = (
  entries: readonly Uncovered[],
): readonly Readonly<{
  scriptName: string;
  directories: readonly string[];
  origin: string;
}>[] => {
  const mut_groups = new Map<
    string,
    Readonly<{ directories: readonly string[]; origin: string }>
  >();

  for (const { command, origin } of entries) {
    const { directory, scriptName } = splitCommandId(command);

    const group = mut_groups.get(scriptName);

    mut_groups.set(scriptName, {
      directories: Arr.toPushed(group?.directories ?? [], directory),
      origin: group?.origin ?? origin,
    });
  }

  return Array.from(mut_groups, ([scriptName, group]) => ({
    scriptName,
    ...group,
  }));
};

/** Up to five directories, and how many more; `.` reads as the root. */
export const listDirectories = (directories: readonly string[]): string => {
  const named = directories.map((directory) =>
    directory === '.' ? 'the root' : directory,
  );

  const shown = named.slice(0, SHOWN_DIRECTORIES).join(', ');

  return named.length > SHOWN_DIRECTORIES
    ? `${shown} and ${named.length - SHOWN_DIRECTORIES} more`
    : shown;
};

export type Uncovered = Readonly<{
  command: CommandId;
  /** `<workflow>: <entry>`, the first CI entry point found reaching it. */
  origin: string;
}>;

/**
 * What CI runs that no diff makes `check-changed` run, on purpose. Each entry
 * is applied to every manifest that defines the script unless it names a
 * directory; where several name a command, the most specific applies
 * ({@link applicableCiOnly}). The README beside this file says the same in prose; this is the
 * list a new CI command has to join, with its reason, or be planned instead.
 */
export const CI_ONLY: readonly CiOnly[] = [
  {
    scriptName: 'ws:build',
    reason:
      'A prerequisite, not a check: check-changed expects `ws:build:deps` already run, and builds what a dependent generator reads itself.',
  },
  {
    scriptName: 'ws:build:deps',
    reason:
      'A prerequisite, not a check: check-changed expects it run before it starts.',
  },
  {
    scriptName: 'z:assert-repo-is-clean',
    reason:
      'check-changed watches every step for what it writes and names the step, which is what this does in CI without the name.',
  },
  {
    directory: '.',
    scriptName: 'z:ci-job',
    reason:
      "Runs a matrix entry's build and the entry and checks the tree; the entry and the build are judged as CI entries themselves.",
  },
  {
    directory: '.',
    scriptName: 'z:check-changed-gap',
    reason:
      'Says, after a failed check, which of its commands check-changed would have run; it checks nothing.',
  },
  {
    scriptName: 'coverage:normalize-paths',
    reason:
      "Rewrites the coverage reports' paths for Codecov; it checks nothing.",
  },
  {
    scriptName: 'check:test:browser',
    reason: 'Needs Playwright and Chromium; slow.',
  },
  {
    scriptName: 'check:e2e',
    reason: 'Needs Playwright, Chromium and a built app; slow.',
  },
  {
    scriptName: 'check:e2e:emulators',
    reason: 'Needs Java and the Firebase emulators.',
  },
  {
    scriptName: 'check:test:rules',
    reason: 'Needs Java and the Firebase emulators.',
  },
  {
    scriptName: 'check:dist',
    reason:
      "Reads a package's own `dist/`, which only `ws:build` writes for every package.",
  },
  {
    scriptName: 'check:dist:branded-number-types',
    reason: 'As `check:dist`.',
  },
  {
    scriptName: 'doc',
    reason:
      "Reads its package's own `dist/`. The samples it embeds in the README and the JSDoc are `gen:readme`'s and `gen:jsdoc`'s, which the package's `gen` runs.",
    writtenBy: ['gen:readme', 'gen:jsdoc'],
  },
  {
    directory: '.',
    scriptName: 'verify:npm-packages',
    reason:
      'Packs and installs every published package. Its committed `local/` copies are `gen:verify-npm-packages`, which check-changed runs.',
    writtenBy: ['gen:verify-npm-packages'],
  },
  {
    directory: '.',
    scriptName: 'verify:npm-packages:published',
    reason:
      'Installs the versions on the registry; nothing in the diff decides it.',
  },
  {
    directory: 'strict-lib/',
    scriptName: 'check:types',
    reason:
      "Each harness type-checks its TypeScript minor over the lib its generators write, which are `strict-lib-gen.yml`'s; check-changed runs the tooling's `strict-lib:check:types`.",
  },
  {
    directory: '.',
    scriptName: 'strict-lib:gen:with-codemod-fixed',
    reason: 'Rewrites thousands of files under `strict-lib/`.',
  },
  {
    directory: '.',
    scriptName: 'strict-lib:gen:version-diff',
    reason: 'As `strict-lib:gen:with-codemod-fixed`.',
  },
] as const;

export type CiOnly = Readonly<{
  /**
   * Every manifest when absent; every one under it when it ends in `/`. Where
   * several entries name a command, the most specific applies
   * ({@link applicableCiOnly}).
   */
  directory?: string;
  scriptName: string;
  reason: string;
  /**
   * The scripts that write what this one leaves committed, which CI's
   * clean-tree check then finds stale: left to CI, the script must not take
   * its generators with it, so some plan has to run each of these the package
   * defines, in its directory (#3099).
   */
  writtenBy?: readonly string[];
}>;

const SHOWN_DIRECTORIES = 5;

/** A directory named exactly, then a longer prefix, then none. */
const specificity = (entry: CiOnly): number =>
  entry.directory === undefined
    ? 0
    : entry.directory.endsWith('/')
      ? entry.directory.length
      : Number.MAX_SAFE_INTEGER;

const DEPS_BUILT_GUARD =
  /^node (?:\.\/|(?:\.\.\/)+)tools\/scripts\/cmd\/assert-deps-built\.mts(?: --workspace)?$/u;

const SCRIPT_RUNNER = /^(?:pnpm run |run-[sp] )/u;

/**
 * A body that runs other scripts and nothing else, the deps-built guard aside:
 * every `&&`-separated part is that guard, or a `pnpm run` or `run-s` / `run-p`
 * of scripts with no arguments of their own.
 */
const isAggregate = (body: string): boolean =>
  body
    .split('&&')
    .map((part) => part.trim())
    .every((part) => {
      if (DEPS_BUILT_GUARD.test(part)) {
        return true;
      }

      if (!SCRIPT_RUNNER.test(part)) {
        return false;
      }

      const { local, recursive } = resolveScriptInvocations(part);

      return Arr.isNonEmpty(local) || Arr.isNonEmpty(recursive);
    });
