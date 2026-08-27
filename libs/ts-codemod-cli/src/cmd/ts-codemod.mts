#!/usr/bin/env node

import * as cmd from 'cmd-ts';
import {
  appendAsConstTransformer,
  convertInterfaceToTypeTransformer,
  convertToReadonlyTransformer,
  enableNoUncheckedIndexedAccessTransformer,
  replaceAnyWithUnknownTransformer,
  replaceRecordWithUnknownRecordTransformer,
} from 'ts-codemod-lib';
import { Arr, Result } from 'ts-data-forge';
import { runTransformerCLI } from './run-transformer-cli.mjs';

/** Every transformer this CLI can apply, keyed by the name `--transformer` takes. */
const transformerFactories = {
  'append-as-const': appendAsConstTransformer,
  'convert-interface-to-type': convertInterfaceToTypeTransformer,
  'convert-to-readonly': convertToReadonlyTransformer,
  'enable-no-unchecked-indexed-access':
    enableNoUncheckedIndexedAccessTransformer,
  'replace-any-with-unknown': replaceAnyWithUnknownTransformer,
  'replace-record-with-unknown-record':
    replaceRecordWithUnknownRecordTransformer,
} as const;

/**
 * The names `--transformer` accepts, in the order `--help` lists them. They
 * are the transformers' own `name` fields, which is also what a
 * `transformer-ignore` comment names. `satisfies` ties the list to the
 * factories above: a name with no factory does not compile.
 */
const transformerNames = [
  'append-as-const',
  'convert-interface-to-type',
  'convert-to-readonly',
  'enable-no-unchecked-indexed-access',
  'replace-any-with-unknown',
  'replace-record-with-unknown-record',
] as const satisfies readonly (keyof typeof transformerFactories)[];

const cmdDef = cmd.command({
  name: 'ts-codemod',
  version: '1.0.1',
  args: {
    baseDir: cmd.positional({
      type: cmd.string,
      displayName: 'baseDir',
      description: 'The base directory in which to perform the conversion',
    }),
    transformer: cmd.multioption({
      long: 'transformer',
      short: 't',
      type: cmd.array(cmd.oneOf(transformerNames)),
      description: [
        'Transformers to apply, given once per transformer. Every selected',
        'transformer runs against each file in a single parse, in the order',
        `given. One of: ${transformerNames.join(', ')}`,
      ].join(' '),
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
    diffFrom: cmd.option({
      long: 'diff-from',
      type: cmd.optional(cmd.string),
      description:
        'If provided, transforms only files that differ from the given base branch or commit hash',
    }),
    silent: cmd.flag({
      long: 'silent',
      type: cmd.optional(cmd.boolean),
      description: 'If true, suppresses output messages (default: false)',
    }),
  },
  handler: (args) => {
    (async (): Promise<void> => {
      const selected = Arr.uniq(args.transformer);

      if (!Arr.isNonEmpty(selected)) {
        console.error(
          `No transformer selected. Pass at least one --transformer <name> (one of: ${transformerNames.join(', ')}).`,
        );

        process.exit(1);
      }

      const result = await runTransformerCLI(
        {
          baseDir: args.baseDir,
          exclude: args.exclude ?? [],
          uncommitted: args.uncommitted ?? false,
          diffFrom: args.diffFrom,
          silent: args.silent ?? false,
        },
        selected.map((name) => transformerFactories[name]()),
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

await cmd.run(cmdDef, Arr.skip(process.argv, 2));
