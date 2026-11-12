import { Arr, Result, unknownToString } from 'ts-data-forge';
import { isDirectlyExecuted } from 'ts-repo-utils';
import type { ReadonlyRecord } from 'ts-type-forge';
import { readRootPackageScripts } from '../lib/repo-files.mjs';

/**
 * Fails when a root script that may run a `pr-merge-queue` command (as defined
 * at `mayRunQueueCommand`) is not exactly
 * `NODE_USE_ENV_PROXY=1 NODE_OPTIONS='--disable-warning=UNDICI-EHPA' tsx --tsconfig ./tools/configs/tsconfig.tsx.json ./libs/<package>/src/cmd/<command>.mts`,
 * `<package>` being `pr-merge-queue` or a `-next` or `-v<n>` rebuild of it. The
 * path may also be `./libs/<package>/src/cmd/<command>/main.mts`.
 *
 * Node's `fetch` reads `HTTPS_PROXY` only when that variable is set, and the
 * proxy of a Claude Code cloud session is what turns the session's token into
 * one GitHub accepts: started without it, a command gets `401 Bad credentials`.
 * The one shape is matched whole rather than the shell read, so that no script
 * passes by a shape this does not follow; one that needs another is a change to
 * this check.
 */
export const checkProxyScripts = async (): Promise<Result<number, string>> => {
  const scripts = await readRootPackageScripts();

  return Result.isErr(scripts)
    ? Result.err(`❌ ${scripts.value}`)
    : judgeProxyScripts(scripts.value);
};

/** The verdict on the root `scripts`: how many it checked, or what to fix. */
export const judgeProxyScripts = (
  scripts: ReadonlyRecord<string, string>,
): Result<number, string> => {
  const { checked, offenders } = findUnproxiedScripts(scripts);

  if (checked === 0) {
    return Result.err(
      '❌ No root script was found that may run a pr-merge-queue command, so this check holds nothing: point it at where the commands moved.',
    );
  }

  return Arr.isNonEmpty(offenders)
    ? Result.err(
        [
          `❌ ${offenders.length} root script(s) may run a pr-merge-queue command but are not the one shape that runs it behind a proxy:`,
          '',
          ...offenders.map((name) => `  package.json: "${name}"`),
          '',
          `Write each as \`${PREFIX}./libs/pr-merge-queue/src/cmd/<command>.mts\` (\`pr-merge-queue-next\`, \`pr-merge-queue-v<n>\` and \`<command>/main.mts\` also fit), with nothing before or after it.`,
          'A script that runs no such command, or has to take another shape, is a change to mayRunQueueCommand or isInShape in tools/scripts/cmd/check-proxy-scripts.mts instead.',
        ].join('\n'),
      )
    : Result.ok(checked);
};

/** Of `scripts`, how many the check holds, and those not in the shape. */
export const findUnproxiedScripts = (
  scripts: ReadonlyRecord<string, string>,
): Readonly<{ checked: number; offenders: readonly string[] }> => {
  const held = Object.entries(scripts).filter(([, script]) =>
    mayRunQueueCommand(script),
  );

  return {
    checked: held.length,
    offenders: held
      .filter(([, script]) => !isInShape(script))
      .map(([name]) => name),
  };
};

// `NODE_OPTIONS` is replaced rather than appended to, as in the scripts that
// had this shape first: a script that needs another Node option sets its own
// (`z:eslint`), so what the command spawns loses nothing a script relies on.
// The variable rather than `http.setGlobalProxyFromEnv()` in the client,
// because that function exists only from Node 25.4 and `engines.node` reaches
// below it.
const PREFIX =
  "NODE_USE_ENV_PROXY=1 NODE_OPTIONS='--disable-warning=UNDICI-EHPA' tsx --tsconfig ./tools/configs/tsconfig.tsx.json ";

const COMMAND_FILE = /^\.\/libs\/([\w-]+)\/src\/cmd\/[\w-]+(?:\/main)?\.mts$/u;

const QUEUE_REBUILD = /^pr-merge-queue-(?:next|v\d+)$/u;

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

if (isDirectlyExecuted(import.meta.url)) {
  const result = await checkProxyScripts().catch((error: unknown) =>
    Result.err(unknownToString(error)),
  );

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(
    `✅ All ${result.value} root script(s) that may run a pr-merge-queue command are in the one shape, which sets NODE_USE_ENV_PROXY=1.`,
  );
}
