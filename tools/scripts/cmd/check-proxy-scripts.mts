import * as path from 'node:path';
import { Arr, memoizeFunction, Result, unknownToString } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import type { ReadonlyRecord } from 'ts-type-forge';
import * as ts from 'typescript';
import {
  cachedModuleReader,
  readWorkspacePackages,
  walkImports,
} from '../lib/import-closure.mjs';
import { packageNameOf } from '../lib/package-name.mjs';
import { readRootPackageScripts } from '../lib/repo-files.mjs';
import { runtimeImportSpecifiersOf } from '../lib/runtime-specifiers.mjs';
import { skipExpressionWrappers } from '../lib/ts-expression-wrappers.mjs';

/**
 * Fails when a root script that may reach the network through Node's `fetch`
 * does not set `NODE_USE_ENV_PROXY=1`, in one of two shapes matched whole:
 *
 * - A script that may run a `pr-merge-queue` command (as defined at
 *   `mayRunQueueCommand`) is exactly
 *   `NODE_USE_ENV_PROXY=1 NODE_OPTIONS='--disable-warning=UNDICI-EHPA' tsx --tsconfig ./tools/configs/tsconfig.tsx.json ./libs/<package>/src/cmd/<command>.mts`,
 *   `<package>` being `pr-merge-queue` or a `-next` or `-v<n>` rebuild of it.
 *   The path may also be `./libs/<package>/src/cmd/<command>/main.mts`.
 * - A script that names a file reaching the network (as defined at
 *   `reachesNetwork`, through what the file imports) is that file run by
 *   `tsx --tsconfig …` or by `node` behind the same two variables, with
 *   arguments after it and nothing else.
 *
 * Node's `fetch` reads `HTTPS_PROXY` only when that variable is set, and the
 * proxy of a Claude Code cloud session is what turns the session's token into
 * one GitHub accepts: started without it, a command gets `401 Bad credentials`.
 * The shapes are matched whole rather than the shell read, so that no script
 * passes by a shape this does not follow; one that needs another is a change to
 * this check.
 */
export const checkProxyScripts = async (): Promise<Result<number, string>> => {
  const scripts = await readRootPackageScripts();

  if (Result.isErr(scripts)) {
    return Result.err(`❌ ${scripts.value}`);
  }

  const workspacePackages = await readWorkspacePackages();

  if (Result.isErr(workspacePackages)) {
    return Result.err(`❌ ${workspacePackages.value}`);
  }

  const networkFiles = findNetworkFiles(
    Arr.uniq(Object.values(scripts.value).flatMap(scriptFiles)),
    { ...cachedModuleReader(), workspacePackages: workspacePackages.value },
  );

  return Result.isErr(networkFiles)
    ? Result.err(`❌ ${networkFiles.value}`)
    : judgeProxyScripts(scripts.value, networkFiles.value);
};

/**
 * The verdict on the root `scripts`, given which of the files they name reach
 * the network: how many scripts it checked, or what to fix.
 */
export const judgeProxyScripts = (
  scripts: ReadonlyRecord<string, string>,
  networkFiles: ReadonlySet<string>,
): Result<number, string> => {
  const { queue, network, held, offenders } = findUnproxiedScripts(
    scripts,
    networkFiles,
  );

  if (queue === 0) {
    return Result.err(
      '❌ No root script was found that may run a pr-merge-queue command, so this check holds nothing: point it at where the commands moved.',
    );
  }

  if (network === 0) {
    return Result.err(
      '❌ No root script was found that names a file which reaches the network, so this check holds nothing of them: see whether reachesNetwork or scriptFiles in tools/scripts/cmd/check-proxy-scripts.mts still find what they did.',
    );
  }

  return Arr.isNonEmpty(offenders)
    ? Result.err(
        [
          `❌ ${offenders.length} root script(s) may reach the network but are not in a shape that runs it behind a proxy:`,
          '',
          ...offenders.map((name) => `  package.json: "${name}"`),
          '',
          `Write a script that runs a pr-merge-queue command as \`${PREFIX}./libs/pr-merge-queue/src/cmd/<command>.mts\` (\`pr-merge-queue-next\`, \`pr-merge-queue-v<n>\` and \`<command>/main.mts\` also fit), with nothing before or after it.`,
          `Write a script that runs a file reaching the network as \`${PREFIX}./<file>.mts [arguments]\` (or \`${ENV}node ./<file>.mts [arguments]\`), with nothing chained to it.`,
          'A script that reaches no network, or has to take another shape, is a change to mayRunQueueCommand, reachesNetwork, isInShape or isInNetworkShape in tools/scripts/cmd/check-proxy-scripts.mts instead.',
        ].join('\n'),
      )
    : Result.ok(held);
};

/**
 * Of `scripts`, how many each rule holds and both together, and those not in
 * the shape of every rule that holds them.
 */
export const findUnproxiedScripts = (
  scripts: ReadonlyRecord<string, string>,
  networkFiles: ReadonlySet<string>,
): Readonly<{
  queue: number;
  network: number;
  held: number;
  offenders: readonly string[];
}> => {
  const judged = Object.entries(scripts).map(([name, script]) => {
    const queue = mayRunQueueCommand(script);

    const network = scriptFiles(script).some((file) => networkFiles.has(file));

    return {
      name,
      queue,
      network,
      offends:
        (queue && !isInShape(script)) || (network && !isInNetworkShape(script)),
    };
  });

  return {
    queue: judged.filter(({ queue }) => queue).length,
    network: judged.filter(({ network }) => network).length,
    held: judged.filter(({ queue, network }) => queue || network).length,
    offenders: judged.filter(({ offends }) => offends).map(({ name }) => name),
  };
};

/**
 * The `.mts` modules `script` names, by paths from the repository root
 * (`tools/scripts/cmd/x.mts`), wherever they stand in its text.
 */
export const scriptFiles = (script: string): readonly string[] =>
  script
    .replaceAll(PWD, './')
    .split(WORD_SEPARATOR)
    .filter((word) => MODULE_PATH.test(word))
    .map(path.posix.normalize)
    .filter((file) => !file.startsWith('../'));

/**
 * Of `entries` (as {@link scriptFiles} names them), those that reach the
 * network: the entry, or a module it loads, at any depth and into any workspace
 * package, matches `reachesNetwork`. Fails on a module it cannot read, so that
 * a path it resolves wrongly is reported rather than passed.
 */
export const findNetworkFiles = (
  entries: readonly string[],
  {
    readSource: read,
    importsOf,
    workspacePackages,
  }: Readonly<{
    readSource: (relativePath: string) => string | undefined;
    importsOf?: (source: string) => readonly string[];
    workspacePackages: ReadonlyMap<string, string>;
  }>,
): Result<ReadonlySet<string>, string> => {
  // Most entries share most of their modules: with `cachedModuleReader`, each
  // is read and searched for its imports once, by the preprocessor `walkImports`
  // shares with `check:root:restart-unblock-prs-paths`, and judged once, by a
  // parse of its own.
  const fileReaches = memoizeFunction(
    (file: string) => reachesNetwork(file, read(file) ?? ''),
    (file: string) => file,
  );

  const mut_found = new Set<string>();

  for (const entry of entries) {
    const closure = walkImports(entry, {
      readSource: read,
      workspacePackages,
      follows: () => true,
      importsOf,
    });

    if (Result.isErr(closure)) {
      return Result.err(
        // The entry rather than the scripts naming it, which a search of
        // package.json for the path finds.
        `${closure.value} (Read because a root script names ${entry}: this check reads every module a root script names, with what it imports.)`,
      );
    }

    if (closure.value.files.some(fileReaches)) {
      mut_found.add(entry);
    }
  }

  return Result.ok(mut_found);
};

// `NODE_OPTIONS` is replaced rather than appended to, as in the scripts that
// had this shape first: a script that needs another Node option sets its own
// (`z:eslint`), so what the command spawns loses nothing a script relies on.
// The variable rather than `http.setGlobalProxyFromEnv()` in the client,
// because that function exists only from Node 25.4 and `engines.node` reaches
// below it. On each script rather than once in a cloud session's environment,
// which the repository does not configure; a command a script starts through
// another process inherits it, when that script sets it.
const ENV =
  "NODE_USE_ENV_PROXY=1 NODE_OPTIONS='--disable-warning=UNDICI-EHPA' ";

const PREFIX =
  `${ENV}tsx --tsconfig ./tools/configs/tsconfig.tsx.json ` as const;

const COMMAND_FILE = /^\.\/libs\/([\w-]+)\/src\/cmd\/[\w-]+(?:\/main)?\.mts$/u;

const QUEUE_REBUILD = /^pr-merge-queue-(?:next|v\d+)$/u;

// The runners of the shape for a file that reaches the network: `tsx` as every
// other root script runs it, or `node` as `mature-updates.mts` is run before
// `pnpm install`.
const NETWORK_RUNNERS = [PREFIX, `${ENV}node `] as const;

// How `scriptFiles` reads a script: `$PWD/` (bare or quoted) is the root, the
// text is cut at whitespace, quotes and shell operators, and a word that is a
// path to a `.mts` module, with `./` or without, is one. Not seen: a module
// given as an option's value (`--import=./x.mts`, not cut at `=`, since such a
// value names an output as often as an input, which a fresh checkout lacks),
// and one with another extension (`.tsx`, `.mjs`, `.js`), which no root script
// runs and which would take in build outputs as sources.
const PWD = /"?\$PWD"?\//gu;

const WORD_SEPARATOR = /[\s"'`;|&()<>]+/u;

const MODULE_PATH = /^[\w.-][\w./-]*\.mts$/u;

// "May run a pr-merge-queue command", the one place it is defined: the script's
// text contains both `pr-merge-queue` and `cmd`, anywhere, in any order and in
// any case. It is coarse on purpose, since holding too much costs a report and
// holding too little lets a command run without the proxy: a script running a
// command passes only by the shape (`isInShape`), and one held that runs none
// is reported, the message sending it here. Not seen: a command run by its bin
// name, which CLAUDE.md ("Build") rules out by running our CLIs from
// `libs/*/src/cmd/`; a command run through a package's own script, which no
// package's script does today; and either word written so that its letters do
// not stand in the text in a row, through a variable, a glob, quotes or
// escapes.
const mayRunQueueCommand = (script: string): boolean => {
  const text = script.toLowerCase();

  return text.includes('pr-merge-queue') && text.includes('cmd');
};

// The path in the shape: a command file of the package or of one of its private
// rebuilds, named as CLAUDE.md's "Repository layout" names them.
const isInShape = (script: string): boolean => {
  if (!script.startsWith(PREFIX)) {
    return false;
  }

  const file = COMMAND_FILE.exec(script.slice(PREFIX.length));

  return (
    file !== null &&
    (file[1] === 'pr-merge-queue' || QUEUE_REBUILD.test(file[1] ?? ''))
  );
};

// "Reaches the network", the one place it is defined: a module the script's
// file loads calls `fetch` by that name, seen through parentheses, `as`,
// `satisfies`, `!` and `<T>` (a call TypeScript parses, so comments do not
// count), or loads at run time (`runtimeImportSpecifiers`) `octokit` or a
// package under `@octokit/`, whose clients call the global `fetch`. Coarse, as
// `mayRunQueueCommand` is: every module the file reaches is read, through a
// barrel or a type-only import too, whether or not the script calls what
// fetches, which costs a report. Not seen: a third-party package other than
// those that fetches (its code is not read), a module `walkImports` does not
// enter (a workspace member outside `libs/`, a subpath of a library that its
// entry does not re-export, a module loaded through a wrapped `require`),
// `node:http(s)`, `fetch` reached by another name, and a file the script runs
// through another process (`pnpm run`, a spawned command) rather than names.
const reachesNetwork = (file: string, text: string): boolean => {
  const callsFetch = (node: ts.Node): boolean => {
    if (ts.isCallExpression(node)) {
      const callee = skipExpressionWrappers(node.expression);

      if (ts.isIdentifier(callee) && callee.text === 'fetch') {
        return true;
      }
    }

    return (
      ts.forEachChild(node, (child) => callsFetch(child) || undefined) ?? false
    );
  };

  const sourceFile = ts.createSourceFile(file, text, ts.ScriptTarget.Latest);

  return (
    runtimeImportSpecifiersOf(sourceFile).some((specifier) => {
      const name = packageNameOf(specifier);

      return name === 'octokit' || name?.startsWith('@octokit/') === true;
    }) || callsFetch(sourceFile)
  );
};

// The shape for a file that reaches the network: one of the runners, the file,
// and words of arguments with no shell operator, quote or expansion among them.
const isInNetworkShape = (script: string): boolean => {
  const runner = NETWORK_RUNNERS.find((prefix) => script.startsWith(prefix));

  if (runner === undefined) {
    return false;
  }

  const [file, ...args] = script.slice(runner.length).split(' ');

  return (
    file !== undefined &&
    /^\.\/[\w./-]+\.mts$/u.test(file) &&
    args.every((arg) => /^[\w./=@-]+$/u.test(arg))
  );
};

if (isDirectlyExecuted(import.meta.url)) {
  const result = await checkProxyScripts().catch((error: unknown) =>
    Result.err(unknownToString(error)),
  );

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(
    `✅ All ${result.value} root script(s) that may reach the network are in a shape that sets NODE_USE_ENV_PROXY=1.`,
  );
}
