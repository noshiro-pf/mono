#!/usr/bin/env -S npx tsx

import * as cmd from 'cmd-ts';
import { formatDiffFrom } from '../functions/index.mjs';

const cmdDef = cmd.command({
  name: 'format-diff-from-cli',
  version: '6.0.1',
  args: {
    base: cmd.positional({
      type: cmd.string,
      displayName: 'base',
      description: 'Base branch name or commit hash to compare against',
    }),
    includeUntracked: cmd.flag({
      long: 'include-untracked',
      type: cmd.optional(cmd.boolean),
      description:
        'Include untracked files in addition to diff files (default: true)',
    }),
    silent: cmd.flag({
      long: 'silent',
      type: cmd.optional(cmd.boolean),
      description: 'If true, suppresses output messages (default: false)',
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
    base: string;
    includeUntracked?: boolean;
    silent?: boolean;
  }>,
): Promise<void> => {
  const result = await formatDiffFrom(args.base, args);

  if (result === 'err') {
    process.exit(1);
  }
};

await cmd.run(cmdDef, process.argv.slice(2));
