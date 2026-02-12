#!/usr/bin/env node

/* transformer-ignore convert-to-readonly */

import * as cmd from 'cmd-ts';
// eslint-disable-next-line import-x/no-internal-modules
import { type InputOf, type OutputOf } from 'cmd-ts/dist/esm/from.js';
import { expectType } from 'ts-data-forge';
import { genIndex } from '../functions/index.mjs';

type Ext = `.${string}`;

const extensionType = cmd.extendType(cmd.string, {
  from: (s) => {
    if (!s.startsWith('.')) {
      throw new Error(`ext should start with '.'`);
    }

    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    return Promise.resolve(s as Ext);
  },
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const nonEmptyArray = <T extends cmd.Type<any, any>>(
  t: T,
  commandName: string,
): cmd.Type<readonly InputOf<T>[], NonEmptyArray<OutputOf<T>>> =>
  cmd.extendType(
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    cmd.array(t) as cmd.Type<readonly InputOf<T>[], OutputOf<T>[]>,
    {
      from: (arr) => {
        if (arr.length === 0) {
          throw new Error(
            `No value provided for --${commandName}. At least one value is required.`,
          );
        }

        // eslint-disable-next-line total-functions/no-unsafe-type-assertion
        return Promise.resolve(arr as unknown as NonEmptyArray<OutputOf<T>>);
      },
    },
  );

const cmdDef = cmd.command({
  name: 'gen-index-ts-cli',
  version: '8.1.0',
  args: {
    // required args
    targetDirectory: cmd.positional({
      type: cmd.string,
      displayName: 'target-directory',
      description:
        'Directory where the index file will be generated  (Comma-separated list can be used)',
    }),

    targetExtensions: cmd.multioption({
      long: 'target-ext',
      type: nonEmptyArray(extensionType, 'target-ext'),
      description: 'File extensions to include in the index file',
    }),
    indexFileExtension: cmd.option({
      long: 'index-ext',
      type: extensionType,
      description: 'Extension of the index file to be generated',
    }),
    exportStatementExtension: cmd.option({
      long: 'export-ext',
      type: cmd.union([
        extensionType,
        cmd.extendType(cmd.string, {
          from: (s) => {
            if (s !== 'none') {
              throw new Error(
                `export-ext should be 'none' or a valid extension`,
              );
            }

            return Promise.resolve('none' as const);
          },
        }),
      ]),
      description: 'Extension of the export statements in the index file',
    }),

    // optional args
    exclude: cmd.multioption({
      long: 'exclude',
      type: cmd.optional(cmd.array(cmd.string)),
      description:
        'Glob patterns of files to exclude from the index file (e.g., "*.d.mts", "*.test.mts")',
    }),
    formatCommand: cmd.option({
      long: 'fmt',
      type: cmd.optional(cmd.string),
      description:
        'Command to format after generating the index file (e.g., "npm run fmt")',
    }),
    silent: cmd.flag({
      long: 'silent',
      type: cmd.optional(cmd.boolean),
      description: 'If true, suppresses output messages (default: false)',
    }),
    minDepth: cmd.option({
      long: 'min-depth',
      type: cmd.optional(cmd.number),
      description: 'Minimum depth to start generating index files (default: 0)',
    }),
  },
  handler: (args) => {
    expectType<typeof args.targetDirectory, string>('=');

    expectType<typeof args.targetExtensions, NonEmptyArray<Ext>>('=');

    expectType<typeof args.exportStatementExtension, Ext | 'none'>('=');

    expectType<typeof args.indexFileExtension, Ext>('=');

    expectType<typeof args.exclude, string[] | undefined>('=');

    expectType<typeof args.formatCommand, string | undefined>('=');

    expectType<typeof args.silent, boolean | undefined>('=');

    expectType<typeof args.minDepth, number | undefined>('=');

    main(args).catch((error: unknown) => {
      console.error('An error occurred:', error);

      process.exit(1);
    });
  },
});

const main = async ({
  targetDirectory,
  targetExtensions,
  exportStatementExtension,
  indexFileExtension,
  exclude,
  formatCommand,
  silent,
  minDepth,
}: Readonly<{
  targetDirectory: string;
  targetExtensions: readonly Ext[];
  exportStatementExtension: Ext | 'none';
  indexFileExtension: Ext;
  exclude?: readonly string[] | undefined;
  formatCommand?: string | undefined;
  silent?: boolean | undefined;
  minDepth?: number | undefined;
}>): Promise<void> => {
  await genIndex({
    targetDirectory: targetDirectory.includes(',')
      ? targetDirectory.split(',').map((dir) => dir.trim())
      : targetDirectory,
    exportStatementExtension,
    targetExtensions,
    exclude,
    indexFileExtension,
    formatCommand,
    silent,
    minDepth,
  });
};

await cmd.run(cmdDef, process.argv.slice(2));
