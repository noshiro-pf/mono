#!/usr/bin/env node

import * as cmd from 'cmd-ts';
import { Result } from 'ts-data-forge';
import { formatDiffFrom } from '../functions/index.mjs';

const cmdDef = cmd.command({
  name: 'format-diff-from-cli',
  version: '7.8.0',
  args: {
    base: cmd.positional({
      type: cmd.string,
      displayName: 'base',
      description: 'Base branch name or commit hash to compare against',
    }),
    excludeUntracked: cmd.flag({
      long: 'exclude-untracked',
      type: cmd.optional(cmd.boolean),
      description:
        'Exclude untracked files in addition to diff files (default: false)',
    }),
    excludeModified: cmd.flag({
      long: 'exclude-modified',
      type: cmd.optional(cmd.boolean),
      description:
        'Exclude modified files in addition to diff files (default: false)',
    }),
    excludeStaged: cmd.flag({
      long: 'exclude-staged',
      type: cmd.optional(cmd.boolean),
      description:
        'Exclude staged files in addition to diff files (default: false)',
    }),
    ignoreUnknown: cmd.flag({
      long: 'ignore-unknown',
      type: cmd.optional(cmd.boolean),
      description: 'Ignore unknown files (default: true)',
    }),
    silent: cmd.flag({
      long: 'silent',
      type: cmd.optional(cmd.boolean),
      description: 'If true, suppresses output messages (default: false)',
    }),
  },
  handler: (args) => {
    main({
      base: args.base,
      excludeUntracked: args.excludeUntracked ?? false,
      excludeModified: args.excludeModified ?? false,
      excludeStaged: args.excludeStaged ?? false,
      ignoreUnknown: args.ignoreUnknown ?? true,
      silent: args.silent ?? false,
    }).catch((error: unknown) => {
      console.error('An error occurred:', error);
      process.exit(1);
    });
  },
});

const main = async (
  args: Readonly<{
    base: string;
    excludeUntracked: boolean;
    excludeModified: boolean;
    excludeStaged: boolean;
    ignoreUnknown: boolean;
    silent: boolean;
  }>,
): Promise<void> => {
  const result = await formatDiffFrom(args.base, {
    includeUntracked: !args.excludeUntracked,
    includeModified: !args.excludeModified,
    includeStaged: !args.excludeStaged,
    ignoreUnknown: args.ignoreUnknown,
    silent: args.silent,
  });

  if (Result.isErr(result)) {
    process.exit(1);
  }
};

await cmd.run(cmdDef, process.argv.slice(2));
