#!/usr/bin/env -S npx tsx

import * as cmd from 'cmd-ts';
import { checkShouldRunTypeChecks } from '../functions/index.mjs';

const cmdDef = cmd.command({
  name: 'check-should-run-type-checks-cli',
  version: '7.0.0',
  args: {
    pathsIgnore: cmd.multioption({
      long: 'paths-ignore',
      type: cmd.optional(cmd.array(cmd.string)),
      description:
        'Patterns to ignore when checking if type checks should run. Supports exact file matches, directory prefixes (ending with "/"), and file extensions (starting with "**.")',
    }),
    baseBranch: cmd.option({
      long: 'base-branch',
      type: cmd.optional(cmd.string),
      description:
        'Base branch to compare against for determining changed files. Defaults to "origin/main"',
    }),
  },
  handler: (args) => {
    main(args).catch((error) => {
      console.error('An error occurred:', error);
      process.exit(1);
    });
  },
});

const main = async (
  args: Readonly<{
    pathsIgnore?: readonly string[];
    baseBranch?: string;
  }>,
): Promise<void> => {
  await checkShouldRunTypeChecks({
    pathsIgnore: args.pathsIgnore,
    baseBranch: args.baseBranch,
  });
};

await cmd.run(cmdDef, process.argv.slice(2));
