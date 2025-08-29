#!/usr/bin/env -S npx tsx

import * as cmd from 'cmd-ts';
import { assertRepoIsClean } from '../functions/index.mjs';

const cmdDef = cmd.command({
  name: 'assert-repo-is-clean-cli',
  version: '7.0.0',
  args: {
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

const main = async (args: Readonly<{ silent?: boolean }>): Promise<void> => {
  await assertRepoIsClean({ silent: args.silent });
};

await cmd.run(cmdDef, process.argv.slice(2));
