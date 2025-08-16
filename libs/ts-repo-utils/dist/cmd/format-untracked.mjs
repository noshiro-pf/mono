#!/usr/bin/env -S npx tsx
import 'child_process';
import * as cmd from 'cmd-ts';
import 'micromatch';
import 'node:child_process';
import 'ts-data-forge';
import { formatUntracked } from '../functions/format.mjs';
import '../node-global.mjs';

const cmdDef = cmd.command({
  name: 'format-untracked-cli',
  version: '6.0.2',
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
const main = async (args) => {
  const result = await formatUntracked({ silent: args.silent });
  if (result === 'err') {
    process.exit(1);
  }
};
await cmd.run(cmdDef, process.argv.slice(2));
//# sourceMappingURL=format-untracked.mjs.map
