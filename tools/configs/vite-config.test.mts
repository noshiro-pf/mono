import { playwright } from '@vitest/browser-playwright';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { Arr, isRecord } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import {
  defaultExclude,
  defineBrowserProject,
  defineViteConfig,
  hasTestFiles,
  nodeProjectExclude,
  usesModuleMocks,
} from './vite-config.mjs';

/** A package root holding `files`, removed once `fn` returns. */
const withPackage = (
  files: ReadonlyRecord<string, string>,
  fn: (root: string) => void,
): void => {
  const packageRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'vite-config-'));

  try {
    for (const [file, content] of Object.entries(files)) {
      const filePath = path.join(packageRoot, file);

      // eslint-disable-next-line security/detect-non-literal-fs-filename
      fs.mkdirSync(path.dirname(filePath), { recursive: true });

      // eslint-disable-next-line security/detect-non-literal-fs-filename
      fs.writeFileSync(filePath, content);
    }

    fn(packageRoot);
  } finally {
    fs.rmSync(packageRoot, { recursive: true, force: true });
  }
};

describe(hasTestFiles, () => {
  test.each<
    Readonly<{
      name: string;
      files: ReadonlyRecord<string, string>;
      expected: boolean;
    }>
  >([
    { name: 'no file at all', files: {}, expected: false },
    {
      name: 'sources only',
      files: { 'src/a.mts': 'export const a = 1;\n' },
      expected: false,
    },
    {
      name: 'a test file under `src/`',
      files: { 'src/a.test.mts': "test('a', () => {});\n" },
      expected: true,
    },
    {
      name: 'a browser test under `test/`',
      files: { 'test/browser/a.test.tsx': "test('a', () => {});\n" },
      expected: true,
    },
    {
      name: 'an in-source test block',
      files: {
        'src/a.mts': 'if (import.meta.vitest !== undefined) {\n}\n',
      },
      expected: true,
    },
  ])('$name', ({ files, expected }) => {
    withPackage(files, (root) => {
      assert.strictEqual(hasTestFiles(root), expected);
    });
  });
});

describe(usesModuleMocks, () => {
  test.each<
    Readonly<{
      name: string;
      files: ReadonlyRecord<string, string>;
      expected: boolean;
    }>
  >([
    {
      name: 'no module mock',
      files: { 'src/a.test.mts': "vi.fn();\nvi.spyOn(console, 'log');\n" },
      expected: false,
    },
    {
      name: '`vi.mock` in a test file',
      files: { 'src/a.test.mts': "vi.mock(import('typescript'));\n" },
      expected: true,
    },
    {
      name: '`vi.doMock` under `test/`',
      files: { 'test/a.test.mts': "vi.doMock('./a.mjs');\n" },
      expected: true,
    },
    {
      name: 'a call split across lines in a `.tsx` sample',
      files: { 'samples/a.tsx': 'vi\n  .mock(\n    "./a.mjs",\n  );\n' },
      expected: true,
    },
    {
      name: 'a name that only starts like one',
      files: { 'src/a.test.mts': 'vi.mocked(f);\nvi.mockObject({});\n' },
      expected: false,
    },
    {
      name: 'a mock outside `src/`, `test/` and `samples/`',
      files: { 'scripts/a.mts': "vi.mock('./a.mjs');\n" },
      expected: false,
    },
    {
      name: 'a mock inside `node_modules`',
      files: { 'src/node_modules/x/a.mts': "vi.mock('./a.mjs');\n" },
      expected: false,
    },
  ])('$name', ({ files, expected }) => {
    withPackage(files, (packageRoot) => {
      expect(usesModuleMocks(packageRoot)).toBe(expected);
    });
  });
});

describe(nodeProjectExclude, () => {
  test('adds test/browser/ after the package’s own exclude', () => {
    assert.deepStrictEqual(nodeProjectExclude(['**/*.d.mts', '**/index.mts']), [
      '**/*.d.mts',
      '**/index.mts',
      'test/browser/**',
    ]);
  });
});

/** The `exclude` of each project in `defineViteConfig`'s `test.projects`. */
const projectExcludes = (projects: readonly unknown[]): readonly unknown[] =>
  projects.map((project) => {
    assert.isTrue(isRecord(project) && isRecord(project['test']));

    const exclude = project['test']['exclude'];

    assert.isTrue(Arr.isArray(exclude));

    return exclude;
  });

describe(defineViteConfig, () => {
  test('gives each project an exclude array of its own built from defaultExclude, so that Vitest adding to one changes no other', () => {
    const excludes = Arr.toPushed(
      projectExcludes(
        defineViteConfig({
          packageRoot: '/package',
          browser: { provider: playwright() },
        }).test.projects,
      ),
      defineBrowserProject({
        packageRoot: '/package',
        browser: { provider: playwright() },
      }).test.exclude,
    );

    const expected: readonly unknown[] = [
      Arr.toPushed(defaultExclude, 'test/browser/**'),
      Array.from(defaultExclude),
      Array.from(defaultExclude),
    ] as const;

    assert.deepStrictEqual(excludes, expected);

    const distinct = new Set(excludes);

    assert.strictEqual(distinct.size, excludes.length);

    assert.isTrue(excludes.every((exclude) => exclude !== defaultExclude));
  });

  test('gives each project an exclude array of its own when the package passes one', () => {
    const exclude = ['skipped/**'] as const;

    const excludes = projectExcludes(
      defineViteConfig({
        packageRoot: '/package',
        node: { exclude },
        browser: { provider: playwright(), exclude },
      }).test.projects,
    );

    assert.deepStrictEqual(excludes, [
      ['skipped/**', 'test/browser/**'],
      ['skipped/**'],
    ]);

    assert.isTrue(excludes.every((e) => e !== exclude));
  });
});

describe('defaultExclude', () => {
  test('is frozen, so that a project handed it uncopied fails when Vitest adds to it', () => {
    assert.isTrue(Object.isFrozen(defaultExclude));
  });
});
