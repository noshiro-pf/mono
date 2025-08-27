#!/usr/bin/env -S npx tsx
import 'child_process';
import * as cmd from 'cmd-ts';
import 'node:child_process';
import 'prettier';
import 'ts-data-forge';
import { genIndex } from '../functions/gen-index.mjs';
import '../node-global.mjs';

const extensionType = cmd.extendType(cmd.string, {
  from: (s) => {
    if (!s.startsWith('.')) {
      throw new Error(`ext should start with '.'`);
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return Promise.resolve(s);
  },
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const nonEmptyArray = (t, commandName) =>
  cmd.extendType(cmd.array(t), {
    from: (arr) => {
      if (arr.length === 0) {
        throw new Error(
          `No value provided for --${commandName}. At least one value is required.`,
        );
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
      return Promise.resolve(arr);
    },
  });
const cmdDef = cmd.command({
  name: 'gen-index-ts-cli',
  version: '6.0.4',
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
            return Promise.resolve('none');
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
  },
  handler: (args) => {
    console.log(args);
    main(args).catch((error) => {
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
}) => {
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
  });
};
await cmd.run(cmdDef, process.argv.slice(2));
//# sourceMappingURL=gen-index-ts.mjs.map
