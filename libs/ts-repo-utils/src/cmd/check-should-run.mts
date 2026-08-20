#!/usr/bin/env node

import * as cmd from 'cmd-ts';
import { Arr } from 'ts-data-forge';
import { checkShouldRun } from '../functions/index.mjs';

const cmdDef = cmd.command({
  name: 'check-should-run-cli',
  version: '10.2.0',
  args: {
    pathsIgnore: cmd.multioption({
      long: 'paths-ignore',
      type: cmd.optional(cmd.array(cmd.string)),
      description:
        'Patterns whose files do not affect the gated step. Matched with micromatch against repository-relative paths, with a trailing "/" as the shorthand for a directory (e.g. "experimental/", ".editorconfig", "**.md"). Defaults to ignoring nothing.',
    }),
    baseBranch: cmd.option({
      long: 'base-branch',
      type: cmd.optional(cmd.string),
      description:
        'Base branch to compare against for determining changed files. Defaults to "origin/main"',
    }),
  },
  handler: (args) => {
    main(args).catch((error: unknown) => {
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
  await checkShouldRun({
    pathsIgnore: args.pathsIgnore,
    baseBranch: args.baseBranch,
  });
};

await cmd.run(cmdDef, Arr.skip(process.argv, 2));
