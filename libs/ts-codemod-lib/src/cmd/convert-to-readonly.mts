#!/usr/bin/env node

import * as cmd from 'cmd-ts';
import { Result } from 'ts-data-forge';
import 'ts-repo-utils';
import { convertToReadonlyTransformer } from '../functions/index.mjs';
import { runTransformerCLI } from './run-transformer-cli.mjs';

const transformer = convertToReadonlyTransformer();

const cmdDef = cmd.command({
  name: transformer.name,
  version: '2.0.1',
  args: {
    baseDir: cmd.positional({
      type: cmd.string,
      displayName: 'baseDir',
      description: 'The base directory in which to perform the conversion',
    }),
    exclude: cmd.multioption({
      long: 'exclude',
      type: cmd.optional(cmd.array(cmd.string)),
      description:
        'Glob patterns of files to exclude from the base directory (e.g., "src/generated/**/*.mts")',
    }),
    uncommitted: cmd.flag({
      long: 'uncommitted',
      type: cmd.optional(cmd.boolean),
      description:
        'If true, transforms only uncommitted files (untracked, modified, and staged files)',
    }),
    silent: cmd.flag({
      long: 'silent',
      type: cmd.optional(cmd.boolean),
      description: 'If true, suppresses output messages (default: false)',
    }),
  },
  handler: (args) => {
    (async (): Promise<void> => {
      const result = await runTransformerCLI(
        {
          baseDir: args.baseDir,
          exclude: args.exclude ?? [],
          uncommitted: args.uncommitted ?? false,
          silent: args.silent ?? false,
        },
        [transformer],
      );

      if (Result.isErr(result)) {
        process.exit(1);
      }
    })().catch((error: unknown) => {
      console.error('An error occurred:', error);

      process.exit(1);
    });
  },
});

await cmd.run(cmdDef, process.argv.slice(2));
