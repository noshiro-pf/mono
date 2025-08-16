#!/usr/bin/env -S npx tsx
import 'child_process';
import * as cmd from 'cmd-ts';
import 'micromatch';
import 'node:child_process';
import 'prettier';
import 'ts-data-forge';
import { assertRepoIsClean } from '../functions/assert-repo-is-clean.mjs';
import '../node-global.mjs';

const cmdDef = cmd.command({
  name: 'assert-repo-is-clean-cli',
  version: '6.0.3',
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
  await assertRepoIsClean({ silent: args.silent });
};
await cmd.run(cmdDef, process.argv.slice(2));
//# sourceMappingURL=assert-repo-is-clean.mjs.map
