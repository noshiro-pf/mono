import dedent from 'dedent';
import { Result } from 'ts-data-forge';
import {
  cachedModuleReader,
  walkImports,
  type Closure,
} from './import-closure.mjs';

describe('walkImports', () => {
  const sources: ReadonlyMap<string, string> = new Map<string, string>([
    [
      'libs/q/src/cmd/worker.mts',
      dedent`
        import { Result } from 'ts-data-forge';
        import * as fs from 'node:fs';
        import { run } from '../worker/index.mjs';
      `,
    ],
    [
      'libs/q/src/worker/index.mts',
      dedent`
        export * from './main.mjs';
      `,
    ],
    [
      'libs/q/src/worker/main.mts',
      dedent`
        import { report } from 'core';
        import { log } from '../lib/index.mjs';
        import type { Options } from './types.mjs';
      `,
    ],
    ['libs/q/src/worker/types.mts', 'export type Options = {};'],
    ['libs/q/src/lib/index.mts', "export * from './log.mjs';"],
    ['libs/q/src/lib/log.mts', "import 'dedent';"],
    ['libs/core/src/entry-point.mts', "import { Arr } from 'ts-data-forge';"],
  ]);

  const workspacePackages: ReadonlyMap<string, string> = new Map<
    string,
    string
  >([
    ['core', 'libs/core'],
    ['ts-data-forge', 'libs/ts-data-forge'],
  ]);

  const walk = (
    follows: (directory: string) => boolean,
  ): Result<Closure, string> =>
    walkImports('libs/q/src/cmd/worker.mts', {
      readSource: (relativePath) => sources.get(relativePath),
      workspacePackages,
      follows,
    });

  test('collects every file reached, through barrels and type imports', () => {
    const closure = Result.unwrapOk(
      walk((directory) => directory === 'libs/core'),
    );

    assert.deepStrictEqual(closure?.files, [
      'libs/core/src/entry-point.mts',
      'libs/q/src/cmd/worker.mts',
      'libs/q/src/lib/index.mts',
      'libs/q/src/lib/log.mts',
      'libs/q/src/worker/index.mts',
      'libs/q/src/worker/main.mts',
      'libs/q/src/worker/types.mts',
    ]);
  });

  test('lists the workspace packages it reached and did not follow', () => {
    const closure = Result.unwrapOk(
      walk((directory) => directory === 'libs/core'),
    );

    assert.deepStrictEqual(closure?.unfollowed, ['ts-data-forge']);
  });

  test('lists every workspace import as written, followed or not', () => {
    const closure = Result.unwrapOk(
      walkImports('libs/q/src/cmd/sub.mts', {
        readSource: (relativePath) =>
          relativePath === 'libs/q/src/cmd/sub.mts'
            ? dedent`
              import { Arr } from 'ts-data-forge/array';
              import { report } from 'core';
              import dedent from 'dedent';
            `
            : sources.get(relativePath),
        workspacePackages,
        follows: (directory) => directory === 'libs/core',
      }),
    );

    assert.deepStrictEqual(closure?.workspaceImports, [
      'core',
      'ts-data-forge',
      'ts-data-forge/array',
    ]);
  });

  test('does not enter a workspace package it is not told to follow', () => {
    const closure = Result.unwrapOk(walk(() => false));

    assert.isDefined(closure);

    assert.notInclude(closure.files, 'libs/core/src/entry-point.mts');

    assert.deepStrictEqual(closure.unfollowed, ['core', 'ts-data-forge']);
  });

  test('fails on a relative import that resolves to no file', () => {
    const result = walkImports('libs/q/src/cmd/broken.mts', {
      readSource: (relativePath) =>
        relativePath === 'libs/q/src/cmd/broken.mts'
          ? "import { x } from '../missing/index.mjs';"
          : undefined,
      workspacePackages,
      follows: () => false,
    });

    assert.isTrue(Result.isErr(result));
  });

  const mjsSources: ReadonlyMap<string, string> = new Map<string, string>([
    ['tools/a.mts', "import x from '../b.mjs';\nimport y from './c.mjs';"],
    ['b.mjs', ''],
    ['tools/c.mts', ''],
    ['tools/c.mjs', ''],
  ]);

  test('resolves a .mjs specifier to a .mjs file when no .mts is beside it', () => {
    const closure = Result.unwrapOk(
      walkImports('tools/a.mts', {
        readSource: (relativePath) => mjsSources.get(relativePath),
        workspacePackages,
        follows: () => false,
      }),
    );

    assert.deepStrictEqual(closure?.files, [
      'b.mjs',
      'tools/a.mts',
      'tools/c.mts',
    ]);
  });
});

describe(cachedModuleReader, () => {
  test('reads each file once, however many walks reach it', () => {
    const cycle: ReadonlyMap<string, string> = new Map<string, string>([
      ['a.mts', "import './b.mjs';"],
      ['b.mts', "import './a.mjs';"],
    ]);

    const mut_reads: string[] = [];

    const reader = cachedModuleReader((relativePath) => {
      mut_reads.push(relativePath);

      return cycle.get(relativePath);
    });

    const walk = (): Result<Closure, string> =>
      walkImports('a.mts', {
        ...reader,
        workspacePackages: new Map<string, string>(),
        follows: () => false,
      });

    assert.deepStrictEqual(walk(), walk());

    assert.deepStrictEqual(mut_reads.toSorted(), ['a.mts', 'b.mts']);
  });

  test('searches each text for its imports once, a changed text again', () => {
    const { importsOf } = cachedModuleReader(() => undefined);

    const text = "import './b.mjs';";

    assert.strictEqual(importsOf(text), importsOf(text));

    assert.deepStrictEqual(importsOf(text), ['./b.mjs']);

    assert.deepStrictEqual(importsOf("import './c.mjs';"), ['./c.mjs']);
  });
});
