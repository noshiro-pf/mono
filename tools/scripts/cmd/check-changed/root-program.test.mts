import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { Result } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import {
  programReach,
  readRootProgramReads,
  rootProgram,
} from './root-program.mjs';

/**
 * A directory of files, written fresh for each case, and the reach of the
 * program its `tsconfig.json` describes, read relative to it.
 */
const reachOf = (files: ReadonlyRecord<string, string>): readonly string[] => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'root-program-'));

  try {
    for (const [name, text] of Object.entries(files)) {
      const file = path.join(root, name);

      // eslint-disable-next-line security/detect-non-literal-fs-filename -- a fixture in the directory just made.
      fs.mkdirSync(path.dirname(file), { recursive: true });

      // eslint-disable-next-line security/detect-non-literal-fs-filename -- a fixture in the directory just made.
      fs.writeFileSync(file, text);
    }

    const program = rootProgram(path.join(root, 'tsconfig.json'));

    if (Result.isErr(program)) {
      throw new Error(program.value);
    }

    return Array.from(programReach(program.value, root)).toSorted();
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
};

const tsconfig = JSON.stringify({
  compilerOptions: {
    module: 'nodenext',
    target: 'esnext',
    strict: true,
    noEmit: true,
    allowImportingTsExtensions: true,
  },
  include: ['./tools/**/*'],
});

describe(programReach, () => {
  test('takes in what the configuration includes and what that imports, a member file by a relative path included', () => {
    assert.deepStrictEqual(
      reachOf({
        'tsconfig.json': tsconfig,
        'tools/a.mts':
          "import { b } from '../libs/x/src/b.mjs';\nexport const a = b;\n",
        'libs/x/src/b.mts': 'export const b = 1;\n',
        'libs/x/src/unread.mts': 'export const c = 1;\n',
      }),
      ['libs/x/src/b.mts', 'tools/a.mts'],
    );
  });

  test('takes in a relative import that is not there, by its path and its source', () => {
    assert.deepStrictEqual(
      reachOf({
        'tsconfig.json': tsconfig,
        'tools/a.mts':
          "// @ts-expect-error TS2307: deleted\nexport { b } from '../libs/x/src/gone.mjs';\n",
      }),
      ['libs/x/src/gone.mjs', 'libs/x/src/gone.mts', 'tools/a.mts'],
    );
  });
});

describe(readRootProgramReads, () => {
  // It builds the repository's root program, which takes seconds.
  test(
    'names the changed files the repository root program reads, a member file among them',
    { timeout: 60_000 },
    () => {
      const reads = Result.unwrapThrow(
        readRootProgramReads([
          'libs/eslint-config-typed/src/rules/node-version-gated-apis.mts',
          'libs/eslint-config-typed/src/index.mts',
          'tools/scripts/cmd/check-changed/plan.mts',
        ]),
      );

      assert.deepStrictEqual(Array.from(reads).toSorted(), [
        'libs/eslint-config-typed/src/rules/node-version-gated-apis.mts',
        'tools/scripts/cmd/check-changed/plan.mts',
      ]);
    },
  );

  test('reads nothing for a diff with no module or JSON', () => {
    const reads = Result.unwrapThrow(
      readRootProgramReads(['README.md', 'libs/x/LICENSE']),
    );

    assert.strictEqual(reads.size, 0);
  });
});
