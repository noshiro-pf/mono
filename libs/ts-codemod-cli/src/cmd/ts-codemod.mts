#!/usr/bin/env node

import * as cmd from 'cmd-ts';
import {
  appendAsConstTransformer,
  convertInterfaceToTypeTransformer,
  convertToReadonlyTransformer,
  enableExplicitFunctionReturnTypeTransformer,
  enableNoUncheckedIndexedAccessTransformer,
  replaceAnyWithUnknownTransformer,
  replaceRecordWithUnknownRecordTransformer,
} from 'ts-codemod-lib';
import { Arr, Result } from 'ts-data-forge';
import { cliVersion } from './cli-version.mjs';
import { runTransformerCLI } from './run-transformer-cli.mjs';
import {
  parseTransformerOptions,
  type TransformerOptions,
} from './transformer-options.mjs';

/**
 * Every transformer this CLI can apply, keyed by the name `--transformer`
 * takes, built with the options `--transformer-options` gives it, if any.
 */
const transformerFactories = {
  'append-as-const': () => appendAsConstTransformer(),
  'convert-interface-to-type': () => convertInterfaceToTypeTransformer(),
  'convert-to-readonly': () => convertToReadonlyTransformer(),
  'enable-explicit-function-return-type': (options: TransformerOptions) =>
    enableExplicitFunctionReturnTypeTransformer(
      options['enable-explicit-function-return-type'],
    ),
  'enable-no-unchecked-indexed-access': () =>
    enableNoUncheckedIndexedAccessTransformer(),
  'replace-any-with-unknown': () => replaceAnyWithUnknownTransformer(),
  'replace-record-with-unknown-record': () =>
    replaceRecordWithUnknownRecordTransformer(),
} as const;

/**
 * The names `--transformer` accepts, in the order `--help` lists them. They are
 * the transformers' own `name` fields, which is also what a
 * `transformer-ignore` comment names. `satisfies` ties the list to the
 * factories above: a name with no factory does not compile.
 */
const transformerNames = [
  'append-as-const',
  'convert-interface-to-type',
  'convert-to-readonly',
  'enable-explicit-function-return-type',
  'enable-no-unchecked-indexed-access',
  'replace-any-with-unknown',
  'replace-record-with-unknown-record',
] as const satisfies readonly (keyof typeof transformerFactories)[];

const cmdDef = cmd.command({
  name: 'ts-codemod',
  version: cliVersion,
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
    transformerOptions: cmd.option({
      long: 'transformer-options',
      type: cmd.optional(cmd.string),
      description: [
        'A JSON object from transformer name to its options, e.g.',
        '\'{"enable-explicit-function-return-type":{"allowExpressions":true}}\'.',
        'Only enable-explicit-function-return-type takes options here: those',
        'of the ESLint rule it applies',
      ].join(' '),
    }),
    project: cmd.option({
      long: 'project',
      short: 'p',
      type: cmd.optional(cmd.string),
      description: [
        'Path to a tsconfig.json. If provided, every file is checked as part of',
        'the project it describes, so that types imported from other modules',
        'resolve; otherwise each file is checked on its own',
      ].join(' '),
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

      const transformerOptions = parseTransformerOptions(
        args.transformerOptions,
        selected,
      );

      if (Result.isErr(transformerOptions)) {
        console.error(transformerOptions.value);

        process.exit(1);
      }

      const result = await runTransformerCLI(
        {
          baseDir: args.baseDir,
          exclude: args.exclude ?? [],
          uncommitted: args.uncommitted ?? false,
          diffFrom: args.diffFrom,
          project: args.project,
          silent: args.silent ?? false,
        },
        selected.map((name) =>
          transformerFactories[name](transformerOptions.value),
        ),
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
