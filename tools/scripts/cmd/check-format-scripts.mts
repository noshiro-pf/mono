import * as path from 'node:path';
import { Arr, Result, unknownToString } from 'ts-data-forge';
import { getWorkspacePackages, isDirectlyExecuted } from 'ts-repo-utils';
import type { ReadonlyRecord } from 'ts-type-forge';
import { projectRootPath } from '../project-root-path.mjs';
import { readScripts } from './check-ci-commands.mjs';

/**
 * Fails when a workspace member formats with Prettier other than through
 * `tools/scripts/cmd/format-package.mts`.
 *
 * Prettier reads `.gitignore` and `.prettierignore` only from the directory it
 * runs in, so a member's bare `prettier --write .` reformats everything the
 * root `.gitignore` ignores there (`dist/`, TypeDoc `docs/`, local data), and
 * nothing fails: the files are untracked. `format-package.mts` passes the root
 * ignore files. So every member's `fix:fmt:full` is that command, climbing to
 * the root by the member's depth, and no member script names the `prettier`
 * binary itself; one that formats what it generated runs the same command with
 * its patterns, climbing the same way (a path copied from a member of another
 * depth fails only when that generator is next run).
 *
 * The root `package.json` is not a member: Prettier run there reads the root
 * ignore files on its own.
 */
export const checkFormatScripts = async (): Promise<Result<number, string>> => {
  const members = await getWorkspacePackages(projectRootPath);

  const offenders = members.flatMap((member) => {
    const dir = path.relative(projectRootPath, member.path);

    return findFormatScriptProblems(dir, readScripts(member.packageJson)).map(
      (problem) => `${dir}: ${problem}`,
    );
  });

  return Arr.isNonEmpty(offenders)
    ? Result.err(
        [
          '❌ These workspace members do not run Prettier through `tools/scripts/cmd/format-package.mts` as their depth needs:',
          ...offenders.map((offender) => `  - ${offender}`),
          '',
          'Prettier reads `.gitignore` and `.prettierignore` only from the',
          'directory it runs in, so in a member it reformats what the root',
          '`.gitignore` ignores; `format-package.mts` passes the root files.',
          'Set `fix:fmt:full` to the command named; any other script runs that',
          'command, climbing as many `../` as named, with its file patterns',
          'appended, instead of `prettier`.',
        ].join('\n'),
      )
    : Result.ok(members.length);
};

/**
 * The `fix:fmt:full` a member at `dir` (relative to the root) must define, and
 * how any of its scripts runs `format-package.mts`.
 */
export const expectedFixFmtFull = (dir: string): string => {
  const up = path.posix.relative(dir.split(path.sep).join('/'), '.');

  return `tsx --tsconfig ${up}/tools/configs/tsconfig.tsx.json ${up}/tools/scripts/cmd/format-package.mts`;
};

/** What is wrong with one member's scripts, as far as Prettier goes. */
export const findFormatScriptProblems = (
  dir: string,
  scripts: ReadonlyRecord<string, string>,
): readonly string[] => {
  const expected = expectedFixFmtFull(dir);

  const fixFmtFull = scripts['fix:fmt:full'];

  return [
    ...(fixFmtFull === undefined || fixFmtFull === expected
      ? []
      : [`\`fix:fmt:full\` must be \`${expected}\``]),
    ...Object.entries(scripts)
      .filter(
        ([name, command]) =>
          name !== 'fix:fmt:full' &&
          command.split(FORMAT_PACKAGE).length !==
            command.split(expected).length,
      )
      .map(
        ([name]) =>
          `\`${name}\` must run \`format-package.mts\` as \`${expected}\``,
      ),
    ...Object.entries(scripts)
      .filter(([, command]) => RUNS_PRETTIER.test(command))
      .map(([name]) => `\`${name}\` runs Prettier directly`),
  ];
};

const FORMAT_PACKAGE = 'tools/scripts/cmd/format-package.mts';

/**
 * The word `prettier` as a command, by name (`prettier@3` included) or by path
 * (`node_modules/.bin/prettier`, `node_modules/prettier/bin/prettier.cjs`): not
 * part of a longer name such as `prettier-plugin-x`, `@prettier/plugin-xml`,
 * `run-prettier.mts`, `.prettierrc`, a directory `prettier/`, the rule id
 * `prettier/prettier` or a script name such as `z:prettier` or `prettier:check`
 * (that script is judged itself).
 */
const RUNS_PRETTIER =
  /(?<![\w./@:-])prettier(?![\w./:-])|\.bin\/prettier(?![\w.-])|(?<![\w@-])prettier\/bin\/prettier/u;

if (isDirectlyExecuted(import.meta.url)) {
  const result = await checkFormatScripts().catch((error: unknown) =>
    Result.err(unknownToString(error)),
  );

  if (Result.isErr(result)) {
    console.error(result.value);

    process.exit(1);
  }

  console.info(
    `✅ All ${result.value} workspace members run Prettier with the root ignore files.`,
  );
}
