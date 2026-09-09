#!/usr/bin/env node

import * as cmd from 'cmd-ts';
import { Result } from 'ts-data-forge';
import { type ReadonlyRecord } from 'ts-type-forge';
import { runCheck, type CheckResult } from '../check/index.mjs';

/**
 * The `sumi` command (D-46). One verb set for every tier; a project's tier
 * decides what a verb does. Only the lint tier exists, so `check` is the
 * verb that works; the others are reserved and say so.
 */

const check = cmd.command({
  name: 'check',
  description:
    'Run the whole Sumi check: locked compilerOptions, type check (native tsc), lint (oxlint preset).',
  args: {
    project: cmd.positional({
      type: cmd.string,
      displayName: 'project',
      description: 'A tsconfig path, or a directory holding tsconfig.json.',
    }),
  },
  handler: ({ project }) => {
    const result = runCheck(project);

    if (Result.isErr(result)) {
      console.error(result.value);

      process.exit(2);
    }

    process.exit(report(result.value));
  },
});

type ReservedCommand = ReturnType<
  typeof cmd.command<ReadonlyRecord<never, never>, () => never>
>;

const reserved = (name: string, description: string): ReservedCommand =>
  cmd.command({
    name,
    description: `${description} (reserved — not implemented in the lint tier)`,
    args: {},
    handler: () => {
      console.error(
        `sumi ${name} is reserved for a later tier (languages/sumi/docs/decisions.md, D-46) and does nothing yet.`,
      );

      process.exit(2);
    },
  });

const sumi = cmd.subcommands({
  name: 'sumi',
  description: 'The Sumi language tools.',
  cmds: {
    check,
    build: reserved('build', 'Emit TypeScript from the sources'),
    eject: reserved('eject', 'Rewrite the sources down one tier'),
    test: reserved('test', 'Run the tests'),
    fix: reserved('fix', 'Apply the fixers and codemods'),
    init: reserved('init', 'Write the configuration files'),
  },
});

/** Prints the result the way the CLI shows it; returns the exit code. */
const report = (result: CheckResult): number => {
  if (result.kind === 'config-violation') {
    console.error(
      `${result.tsconfigPath}: the effective compilerOptions differ from the Sumi lock (languages/sumi/docs/spec/compiler-options.md). Nothing else was checked.`,
    );

    for (const violation of result.violations) {
      console.error(
        `  ${violation.option}: expected ${JSON.stringify(violation.expected)}, got ${JSON.stringify(violation.actual)}`,
      );
    }

    return 1;
  }

  if (result.typeCheck.diagnostics.length > 0) {
    console.error(result.typeCheck.output.trimEnd());
  }

  for (const diagnostic of result.lint.diagnostics) {
    console.error(
      `${diagnostic.filename}(${diagnostic.line}): ${diagnostic.code}: ${diagnostic.message}`,
    );
  }

  if (result.lint.stderr.trim() !== '') {
    console.error(result.lint.stderr.trimEnd());
  }

  console.error(
    result.ok
      ? `sumi check: ${result.fileCount} files, no problems.`
      : `sumi check: ${result.fileCount} files, ${result.typeCheck.diagnostics.length} type errors, ${result.lint.diagnostics.length} lint problems.`,
  );

  return result.ok ? 0 : 1;
};

await cmd.run(cmd.binary(sumi), process.argv);
