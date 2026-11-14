import dedent from 'dedent';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { Result } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import { projectRootPath } from '../../project-root-path.mjs';
import { workspaceLibraries } from './generator-entries.mjs';
import {
  importGraph,
  tsxProgram,
  UNFOLLOWED,
  type WorkspaceLibrary,
} from './import-graph.mjs';
import { readPackages } from './packages.mjs';

/**
 * A directory of modules, written fresh for each case, and the graph of
 * `entry.mts` read relative to it.
 */
const graphOf = (
  files: ReadonlyRecord<string, string>,
  /**
   * Inside the repository (its ignored `out/`), so that a workspace library
   * imported by name is in the graph, which is then read from the repository's
   * root; else a directory of its own.
   */
  inRepository = false,
  libraries: ReadonlyMap<string, WorkspaceLibrary> = new Map<
    string,
    WorkspaceLibrary
  >(),
): readonly string[] => {
  const parent = inRepository ? path.join(projectRootPath, 'out') : os.tmpdir();

  // eslint-disable-next-line security/detect-non-literal-fs-filename -- the repository's ignored `out/`, or the system's temporary directory.
  fs.mkdirSync(parent, { recursive: true });

  const root = fs.mkdtempSync(path.join(parent, 'import-graph-'));

  try {
    for (const [name, text] of Object.entries(files)) {
      // eslint-disable-next-line security/detect-non-literal-fs-filename -- a fixture in the directory just made.
      fs.writeFileSync(
        path.join(root, name),
        text.split('ABSOLUTE').join(root),
      );
    }

    const entry = path.join(root, 'entry.mts');

    const program = tsxProgram([entry]);

    if (Result.isErr(program)) {
      throw new Error(program.value);
    }

    return importGraph(program.value, entry, {
      root: inRepository ? projectRootPath : root,
      libraries,
    });
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
};

describe('importGraph', () => {
  test('follows a relative import, a bare import and a barrel’s re-exports', () => {
    assert.deepStrictEqual(
      graphOf({
        'entry.mts': dedent`
          import { a } from './a.mjs';
          import './side.mjs';
          export * from './barrel.mjs';
          export {} from './empty.mjs';
          console.log(a);
        `,
        'a.mts': 'export const a = 1;\n',
        'side.mts': 'console.log(0);\n',
        'barrel.mts': "export * from './inner.mjs';\n",
        'inner.mts': 'export const inner = 1;\n',
        'empty.mts': 'console.log(1);\n',
      }),
      [
        'a.mts',
        'barrel.mts',
        'empty.mts',
        'entry.mts',
        'inner.mts',
        'side.mts',
      ],
    );
  });

  test('leaves out `import type` and `export type`, and takes a list of `type` names to run the module, as Node’s type stripping does', () => {
    assert.deepStrictEqual(
      graphOf({
        'entry.mts': dedent`
          import type { A } from './a.mjs';
          import { type B } from './b.mjs';
          export type { C } from './c.mjs';
          export { type D } from './d.mjs';
          import { type E, e } from './e.mjs';
          export const x: A | B = e;
        `,
        'a.mts': 'export type A = 1;\n',
        'b.mts': 'export type B = 1;\n',
        'c.mts': 'export type C = 1;\n',
        'd.mts': 'export type D = 1;\n',
        'e.mts': 'export type E = 1;\nexport const e = 1;\n',
      }),
      ['b.mts', 'd.mts', 'e.mts', 'entry.mts'],
    );
  });

  test('follows an absolute import as a relative one', () => {
    const graph = graphOf({
      'entry.mts': "import 'ABSOLUTE/a.mjs';\n",
      'a.mts': 'console.log(0);\n',
    });

    assert.include(graph, 'a.mts');
  });

  test('takes an absolute import of a module that is not there by its path', () => {
    assert.deepStrictEqual(
      graphOf({ 'entry.mts': "import 'ABSOLUTE/gone.mjs';\n" }),
      ['entry.mts', 'gone.mjs', 'gone.mts'],
    );
  });

  test('takes a module that is not there by its path and its source’s', () => {
    assert.deepStrictEqual(
      graphOf({
        'entry.mts': dedent`
          import { gone } from './gone.mjs';
          console.log(gone);
        `,
      }),
      ['entry.mts', 'gone.mjs', 'gone.mts'],
    );
  });

  describe('by package name', () => {
    test('takes a named import and a re-export by name each to its declaration', () => {
      const graph = graphOf(
        {
          'entry.mts': dedent`
            import { assertPathExists } from 'ts-repo-utils';
            export { glob } from 'ts-repo-utils';
            await assertPathExists('.');
          `,
        },
        true,
      );

      assert.includeMembers(graph, [
        'libs/ts-repo-utils/src/functions/assert-path-exists.mts',
        'libs/ts-repo-utils/src/functions/glob.mts',
      ]);
    });

    test.each([
      dedent`
        import * as repo from 'ts-repo-utils';
        console.log(repo);
      `,
      "import 'ts-repo-utils';",
      "import {} from 'ts-repo-utils';",
      "export * from 'ts-repo-utils';",
    ])('takes `%s` to the library’s entry', (text) => {
      assert.include(
        graphOf({ 'entry.mts': text }, true),
        'libs/ts-repo-utils/src/entry-point.mts',
      );
    });

    test('leaves out a list of `type` names imported by package name', () => {
      assert.deepStrictEqual(
        graphOf(
          {
            'entry.mts': dedent`
              import { type Result } from 'ts-repo-utils';
              export const r: Result<1, 2> | 0 = 0;
            `,
          },
          true,
        ).filter((file) => file.startsWith('libs/')),
        [],
      );
    });

    test('takes a library resolved to its build output as its sources whole, with what it may run', async () => {
      // A generator whose package resolves `eslint-rule-forge` to its `dist/`.
      const entry =
        'libs/eslint-plugin-synstate/scripts/cmd/gen-rule-types.mts';

      const program = tsxProgram([entry]);

      if (Result.isErr(program)) {
        throw new Error(program.value);
      }

      const libraries = workspaceLibraries(await readPackages());

      const graph = importGraph(program.value, entry, { libraries });

      assert.include(graph, 'libs/eslint-rule-forge/src/');

      assert.isFalse(graph.some((file) => file.includes('/dist/')));

      const ruleForge = libraries.get('eslint-rule-forge');

      assert.isDefined(ruleForge);

      for (const dependency of ruleForge.dependencies) {
        const dir = libraries.get(dependency)?.dir;

        if (dir !== undefined && !UNFOLLOWED.has(dependency)) {
          assert.include(graph, `${dir}/src/`);
        }
      }
    }, 60_000);

    test('takes a workspace library not resolved to its sources whole, with what it depends on', () => {
      const libraries = new Map<string, WorkspaceLibrary>([
        ['not-built', { dir: 'libs/not-built', dependencies: ['dep'] }],
        ['dep', { dir: 'libs/dep', dependencies: ['ts-data-forge'] }],
        ['ts-data-forge', { dir: 'libs/ts-data-forge', dependencies: [] }],
      ]);

      assert.deepStrictEqual(
        graphOf(
          {
            'entry.mts': dedent`
              // @ts-expect-error -- a package that is not there, as one not yet built is not.
              import { x } from 'not-built';
              console.log(x);
            `,
          },
          true,
          libraries,
        ).filter((file) => file.startsWith('libs/')),
        ['libs/dep/src/', 'libs/not-built/src/'],
      );
    });

    test('takes a relative import into a library’s build output as its sources whole', () => {
      assert.deepStrictEqual(
        graphOf(
          {
            'entry.mts': dedent`
              import * as built from '../../libs/eslint-rule-forge/dist/index.mjs';
              console.log(built);
            `,
          },
          true,
          new Map<string, WorkspaceLibrary>([
            [
              'eslint-rule-forge',
              { dir: 'libs/eslint-rule-forge', dependencies: [] },
            ],
          ]),
        ).filter((file) => file.startsWith('libs/')),
        ['libs/eslint-rule-forge/src/'],
      );
    });

    test('takes a relative import into an unfollowed library’s build output as its sources', () => {
      const graph = graphOf(
        {
          'entry.mts': dedent`
            import * as forge from '../../libs/ts-data-forge/dist/index.mjs';
            console.log(forge);
          `,
        },
        true,
        new Map<string, WorkspaceLibrary>([
          ['ts-data-forge', { dir: 'libs/ts-data-forge', dependencies: [] }],
        ]),
      );

      assert.include(graph, 'libs/ts-data-forge/src/');
    });
  });
});
