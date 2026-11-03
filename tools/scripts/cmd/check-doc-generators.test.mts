import dedent from 'dedent';
import type { ReadonlyRecord } from 'ts-type-forge';
import {
  findDocOnlyGenerators,
  parseScriptEntries,
  parseScriptInvocations,
  readModule,
} from './check-doc-generators.mjs';

const tsx = (file: string): string =>
  `tsx --tsconfig ../../tools/configs/tsconfig.tsx.json ${file}` as const;

const check = (
  scripts: ReadonlyRecord<string, string>,
  sources: ReadonlyRecord<string, string> = {},
): readonly string[] =>
  findDocOnlyGenerators({
    packageDir: 'libs/pkg',
    scripts,
    readSource: (file) => sources[file],
  });

describe('parseScriptEntries', () => {
  test('reads the file after the tsconfig option, relative to the package', () => {
    assert.deepStrictEqual(
      parseScriptEntries(tsx('./scripts/cmd/gen-docs.mts')),
      ['scripts/cmd/gen-docs.mts'],
    );
  });

  test('reads every tsx of a chained body', () => {
    assert.deepStrictEqual(
      parseScriptEntries(
        `${tsx('./scripts/a.mts')} && pnpm run gen:jsdoc && ${tsx('./scripts/b.mts')} --flag`,
      ),
      ['scripts/a.mts', 'scripts/b.mts'],
    );
  });

  test('keeps an entry outside the package as a parent path', () => {
    assert.deepStrictEqual(
      parseScriptEntries(
        tsx('../../libs/ts-repo-utils/src/cmd/gen-index-ts.mts'),
      ),
      ['../../libs/ts-repo-utils/src/cmd/gen-index-ts.mts'],
    );
  });

  test('reads a quoted path, and a file node runs', () => {
    assert.deepStrictEqual(
      parseScriptEntries('tsx "./scripts/a.mts" && node ./scripts/b.mjs'),
      ['scripts/a.mts', 'scripts/b.mjs'],
    );
  });

  test('reads nothing from a body without tsx', () => {
    assert.deepStrictEqual(parseScriptEntries('run-s gen:readme fix:fmt'), []);
  });
});

describe('parseScriptInvocations', () => {
  test('reads a pnpm run with arguments and every name of a run-s list', () => {
    assert.deepStrictEqual(
      parseScriptInvocations(
        'pnpm run gen:listing --x && run-s gen:readme fix:fmt',
      ),
      ['gen:listing', 'gen:readme', 'fix:fmt'],
    );
  });

  test('leaves out a run in another package or the root', () => {
    assert.deepStrictEqual(
      parseScriptInvocations(
        'pnpm run --filter other gen:x && pnpm run -w gen:y && pnpm run -C ../a gen:z',
      ),
      [],
    );
  });

  test('leaves out a recursive run', () => {
    assert.deepStrictEqual(
      parseScriptInvocations('pnpm run --recursive --if-present doc'),
      [],
    );
  });
});

describe('readModule', () => {
  test('reads re-exports, bare imports and dynamic imports, and not export type', () => {
    assert.deepStrictEqual(
      readModule(dedent`
        export { a } from './a.mjs';
        export type { B } from './b.mjs';
        import './c.mjs';
        const d = await import('./d.mjs');
      `).relativeImports,
      ['./a.mjs', './c.mjs', './d.mjs'],
    );
  });

  test('reads value imports, single and multi-line, and skips type imports and packages', () => {
    assert.deepStrictEqual(
      readModule(dedent`
        import * as path from 'node:path';
        import { $, Result } from 'ts-repo-utils';
        import type { Foo } from '../types.mjs';
        import { genTypeDefinitions } from '../functions/index.mjs';
        import {
          embedExamples,
          other,
        } from './embed-examples.mjs';
        import { type Bar, type Baz } from './types.mjs';
      `).relativeImports,
      ['../functions/index.mjs', './embed-examples.mjs'],
    );
  });

  test('finds a write by method, and by a renamed import', () => {
    assert.isTrue(
      readModule(dedent`
        import * as fs from 'node:fs/promises';

        await fs.writeFile('README.md', text);
      `).writesFiles,
    );

    assert.isTrue(
      readModule(dedent`
        import { writeFile as save } from 'node:fs/promises';

        await save('README.md', text);
      `).writesFiles,
    );
  });

  test('finds a write by a name destructured from fs, and through fs.promises', () => {
    assert.isTrue(
      readModule(dedent`
        import * as fs from 'node:fs';

        const { rmSync } = fs;

        rmSync('README.md');
      `).writesFiles,
    );

    assert.isTrue(
      readModule(dedent`
        const { writeFile } = await import('node:fs/promises');

        await writeFile('README.md', text);
      `).writesFiles,
    );

    assert.isTrue(
      readModule(dedent`
        import fs from 'node:fs';

        await fs.promises.writeFile('README.md', text);
      `).writesFiles,
    );
  });

  test('does not take a method of another object for a write', () => {
    assert.isFalse(
      readModule(dedent`
        import { $ } from 'ts-repo-utils';

        map.rename('key');
        await $.cp('a', 'b');
      `).writesFiles,
    );
  });

  test('reads a dynamic import written as a template', () => {
    assert.deepStrictEqual(
      readModule('await import(`./write-listing.mjs`);').relativeImports,
      ['./write-listing.mjs'],
    );
  });

  test('does not take a string or a comment for code', () => {
    const parsed = readModule(dedent`
      import * as fs from 'node:fs/promises';
      // await fs.writeFile(a, b);
      const glob = 'src/*.mts';
      const url = 'https://example.com';
      await fs.writeFile(path, text);
      /* import { x } from './x.mjs'; */
    `);

    assert.isTrue(parsed.writesFiles);

    assert.deepStrictEqual(parsed.relativeImports, []);

    assert.isFalse(
      readModule("const note = 'fs.writeFile(a, b)';").writesFiles,
    );
  });
});

describe('findDocOnlyGenerators', () => {
  test('accepts a doc made of the scripts gen runs', () => {
    assert.deepStrictEqual(
      check({
        doc: 'run-s gen:readme gen:jsdoc fix:fmt',
        gen: 'run-s gen:index gen:readme gen:jsdoc',
        'gen:index': 'run-s gen:index:src fix:fmt',
        'gen:index:src': tsx(
          '../../libs/ts-repo-utils/src/cmd/gen-index-ts.mts',
        ),
        'gen:readme': tsx('./scripts/cmd/embed-examples.mts'),
        'gen:jsdoc': tsx('./scripts/cmd/embed-examples-in-jsdoc.mts'),
        'fix:fmt': 'prettier --write .',
      }),
      [],
    );
  });

  test("accepts a doc script that imports gen's entry points, the root path and src/", () => {
    assert.deepStrictEqual(
      check(
        {
          doc: tsx('./scripts/cmd/gen-docs.mts'),
          gen: 'run-s gen:readme gen:jsdoc',
          'gen:readme': tsx('./scripts/cmd/embed-examples.mts'),
          'gen:jsdoc': tsx('./scripts/cmd/embed-examples-in-jsdoc.mts'),
        },
        {
          'scripts/cmd/gen-docs.mts': dedent`
            import { unknownToString } from '../../src/entry-point.mjs';
            import { workspaceRootPath } from '../workspace-root-path.mjs';
            import { embedExamplesInJsDoc } from './embed-examples-in-jsdoc.mjs';
            import { embedExamples } from './embed-examples.mjs';
          `,
        },
      ),
      [],
    );
  });

  test('reports a generator the doc script imports and no gen script runs', () => {
    const violations = check(
      {
        doc: tsx('./scripts/cmd/gen-docs.mts'),
        gen: 'run-s gen:readme',
        'gen:readme': tsx('./scripts/cmd/embed-examples.mts'),
      },
      {
        'scripts/cmd/gen-docs.mts': dedent`
          import { genTypeDefinitions } from '../functions/index.mjs';
          import { embedExamples } from './embed-examples.mjs';
        `,
      },
    );

    assert.strictEqual(violations.length, 1);

    assert.include(violations[0], 'libs/pkg/scripts/cmd/gen-docs.mts');

    assert.include(violations[0], 'libs/pkg/scripts/functions/index.mts');
  });

  test('reports a file a script outside gen runs when it writes files itself', () => {
    const violations = check(
      {
        doc: 'run-s gen:readme doc:listing',
        gen: 'run-s gen:readme',
        'gen:readme': tsx('./scripts/cmd/embed-examples.mts'),
        'doc:listing': tsx('./scripts/cmd/gen-listing.mts'),
      },
      {
        'scripts/cmd/gen-listing.mts': dedent`
          import * as fs from 'node:fs/promises';

          await fs.writeFile('README.md', 'listing', 'utf8');
        `,
      },
    );

    assert.strictEqual(violations.length, 1);

    assert.include(violations[0], 'libs/pkg/scripts/cmd/gen-listing.mts');
  });

  test('accepts a doc script that runs a file gen runs too', () => {
    assert.deepStrictEqual(
      check({
        doc: tsx('./scripts/cmd/embed-examples.mts'),
        gen: 'run-s gen:readme',
        'gen:readme': tsx('./scripts/cmd/embed-examples.mts'),
      }),
      [],
    );
  });

  test('reports a doc in a package with no gen when it runs a generator of its own', () => {
    assert.strictEqual(
      check(
        { doc: tsx('./scripts/cmd/gen-docs.mts') },
        {
          'scripts/cmd/gen-docs.mts':
            "import { embedExamples } from './embed-examples.mjs';",
        },
      ).length,
      1,
    );
  });

  test('reports a gen: script doc reaches and gen does not, by its name', () => {
    const violations = check({
      doc: 'pnpm run gen:readme -- --flag',
      gen: 'run-s gen:index',
      'gen:index': tsx('../../libs/ts-repo-utils/src/cmd/gen-index-ts.mts'),
      'gen:readme': tsx('./scripts/cmd/embed-examples.mts'),
    });

    assert.deepStrictEqual(violations, [
      'libs/pkg: `doc` runs `gen:readme`, which `gen` does not.',
    ]);
  });

  test('reports a doc-only file that imports a shared embedder outside the package', () => {
    const violations = check(
      {
        doc: tsx('./scripts/cmd/embed-examples.mts'),
        gen: 'run-s gen:index',
        'gen:index': tsx('../../libs/ts-repo-utils/src/cmd/gen-index-ts.mts'),
      },
      {
        'scripts/cmd/embed-examples.mts': dedent`
          import { embedExamplesInMarkdown } from '../../../../tools/configs/embed-examples-in-markdown.mjs';
          import { workspaceRootPath } from '../workspace-root-path.mjs';
        `,
      },
    );

    assert.deepStrictEqual(violations, [
      'libs/pkg/scripts/cmd/embed-examples.mts imports tools/configs/embed-examples-in-markdown.mts, which no `gen` script runs.',
    ]);
  });

  test('reads a dynamic import of a generator', () => {
    assert.strictEqual(
      check(
        { doc: tsx('./scripts/cmd/gen-docs.mts') },
        {
          'scripts/cmd/gen-docs.mts':
            "const m = await import('../functions/index.mjs');",
        },
      ).length,
      1,
    );
  });

  test('does not read a write named in a comment', () => {
    assert.deepStrictEqual(
      check(
        { doc: tsx('./scripts/cmd/gen-docs.mts') },
        {
          'scripts/cmd/gen-docs.mts': dedent`
            // Leaves writeFile( to the generators.
            /* fs.cp(a, b) */
          `,
        },
      ),
      [],
    );
  });

  test('accepts a package without doc', () => {
    assert.deepStrictEqual(check({ gen: 'run-s gen:readme' }), []);
  });
});
