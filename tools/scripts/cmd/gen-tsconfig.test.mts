import dedent from 'dedent';
import { Result } from 'ts-data-forge';
import type { MemberTsconfig } from '../../configs/member-tsconfig.mjs';
import {
  committableFiles,
  declarationProblems,
  entryProblems,
  memberDirsOf,
  renderMemberTsconfig,
} from './gen-tsconfig.mjs';

const render = (
  dir: string,
  files: readonly string[],
  entry: MemberTsconfig = {},
  manifestExports?: unknown,
): string =>
  renderMemberTsconfig({
    dir,
    name: dir.slice(dir.lastIndexOf('/') + 1),
    manifestExports,
    published: undefined,
    files: files.map((file) => `${dir}/${file}`),
    entry,
    srcFileExists: (rel) => files.includes(rel),
  });

const LIB_REPLACEMENT_NOTE = dedent`
  // Opted into the strict standard library. Both TypeScript 6 and 7 default
  // \`libReplacement\` to false, so the \`@typescript/lib-*\` links the root
  // \`prepare\` script writes do nothing without it. Stated here, with a probe:
  // \`check:root:tsconfig-lib-replacement\` requires both. See
  // docs/strict-typescript-lib-integration.md.
`;

describe('renderMemberTsconfig', () => {
  test('a plain member: the two bases, libReplacement and the directories it has, in order', () => {
    assert.strictEqual(
      render('libs/x', ['scripts/a.mts', 'src/index.mts', 'test/a.test.mts']),
      `${dedent`
        {
        "extends": ["../../tools/configs/tsconfig/tsconfig.type-check.json","../../tools/configs/tsconfig/tsconfig.vite.json"],
        "compilerOptions": {
        ${LIB_REPLACEMENT_NOTE}
        "libReplacement": true
        },
        "include": ["./src","./test","./scripts"]
        }
      `}\n`,
    );
  });

  test('a member with samples/ maps its own name and its dist subpaths to the sources', () => {
    const text = render(
      'libs/x',
      ['samples/a.mts', 'src/index.mts', 'src/sub.mts'],
      {},
      {
        '.': {
          import: { types: './dist/index.d.mts', default: './dist/index.mjs' },
        },
        './sub': './dist/sub.mjs',
        './style.css': './css/style.css',
        './missing': './dist/missing.mjs',
      },
    );

    assert.include(
      text,
      '"paths": {\n"x": ["./src/index.mts"],\n"x/sub": ["./src/sub.mts"]\n}',
    );
  });

  test('a member without samples/ maps nothing unless it declares selfPaths', () => {
    const manifestExports = { '.': './dist/index.mjs' } as const;

    assert.notInclude(
      render('libs/x', ['src/index.mts'], {}, manifestExports),
      '"paths"',
    );

    assert.include(
      render(
        'libs/x',
        ['src/index.mts'],
        { selfPaths: true, notes: { paths: 'The tests import it by name.' } },
        manifestExports,
      ),
      '// The tests import it by name.\n"paths"',
    );
  });

  test('jsx sets jsxImportSource alone, the base setting jsx', () => {
    const text = render('apps/x', ['src/a.tsx'], { jsx: 'synstate-dom' });

    assert.include(text, '"jsxImportSource": "synstate-dom"');

    assert.notInclude(text, '"jsx":');
  });

  test('nodeOnly adds the Node-only base last', () => {
    assert.include(
      render('apps/x', ['src/a.mts'], { nodeOnly: true }),
      'tsconfig.vite.json","../../tools/configs/tsconfig/tsconfig.node-only.json"]',
    );
  });

  test('omitDirs, includeFiles and exclude, each note above its block', () => {
    const text = render(
      'apps/x-docs',
      ['src/pages/a.astro', 'samples/a.tsx', 'astro.config.mjs'],
      {
        omitDirs: ['src'],
        includeFiles: ['./astro.config.mjs'],
        exclude: ['./src/content.config.ts'],
        notes: { include: 'Astro checks its pages.', exclude: 'Astro only.' },
      },
    );

    assert.include(
      text,
      dedent`
        // Astro checks its pages.
        "include": ["./samples","./astro.config.mjs"],
        // Astro only.
        "exclude": ["./src/content.config.ts"]
      `,
    );
  });

  test('the note on extends is written above it', () => {
    assert.include(
      render('libs/x', ['src/a.mts'], {
        withoutVite: true,
        notes: { extends: 'No Vitest here.' },
      }),
      '{\n// No Vitest here.\n"extends": ["../../tools/configs/tsconfig/tsconfig.type-check.json"],',
    );
  });

  test('a test/ that holds only the strict-lib probe gets the standard note', () => {
    assert.include(
      render('libs/x', ['src/a.mts', 'test/strict-lib-active.mts']),
      '// `./test` holds only `strict-lib-active.mts`, the probe that fails when\n// the replacement above stops happening.\n"include"',
    );
  });

  test.each([
    ['apps/x', '../../'],
    ['libs/x', '../../'],
    ['languages/sumi/x', '../../../'],
  ] as const)('the extends path of %s starts with %s', (dir, up) => {
    assert.include(
      render(dir, ['src/a.mts']),
      `"extends": ["${up}tools/configs/tsconfig/tsconfig.type-check.json"`,
    );
  });
});

describe(entryProblems, () => {
  test.each([
    [
      { compilerOptions: { lib: [] } },
      '`compilerOptions` needs `notes.compilerOptions`',
    ],
    [{ omitDirs: ['src'] }, '`omitDirs` needs `notes.include`'],
    [{ exclude: ['./x'] }, '`exclude` needs `notes.exclude`'],
    [{ selfPaths: true }, '`selfPaths` needs `notes.paths`'],
    [{ withoutVite: true }, '`withoutVite` needs `notes.extends`'],
  ] as const)('refuses %o without its note', (entry, problem) => {
    assert.deepStrictEqual(entryProblems(entry), [problem]);
  });

  test('takes a departure with its note', () => {
    assert.deepStrictEqual(
      entryProblems({
        compilerOptions: { lib: [] },
        notes: { compilerOptions: 'why' },
      }),
      [],
    );
  });
});

describe(declarationProblems, () => {
  test('refuses an entry or a hand-written member that names no member', () => {
    const problems = declarationProblems([]);

    assert.include(
      problems,
      '`apps/profile` names no member with a tsconfig.json.',
    );

    assert.include(
      problems,
      '`libs/ts-type-forge` in `handWritten` names no member with a tsconfig.json.',
    );
  });

  // The table in tools/configs/member-tsconfig.mts against the members that
  // exist: a member renamed or removed leaves an entry naming nothing.
  test('finds nothing wrong with the declarations against the repository', async () => {
    const files = await committableFiles();

    assert.isTrue(Result.isOk(files));

    assert.deepStrictEqual(declarationProblems(memberDirsOf(files.value)), []);
  });
});
