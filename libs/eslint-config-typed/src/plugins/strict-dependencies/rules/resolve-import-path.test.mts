import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import type { ReadonlyRecord } from 'ts-type-forge';
import type * as ts from 'typescript';
import { readTsConfig, resolveImportPath } from './resolve-import-path.mjs';

// FIXME: https://github.com/knowledge-work/eslint-plugin-strict-dependencies/tree/v1.3.27 のテストをコピーしてきて
// Codex でテスト・型チェックが通るようにさせただけなので、意味の無いテストになっていないかチェックして修正する

const compilerOptionsByFixture = {
  'no-paths': {},
  'paths-basic': {
    paths: {
      '@/components/': ['components/'],
      '@/components': ['components'],
      '@/components/*': ['components/*'],
    },
  },
  // `paths` are resolved from the tsconfig.json whatever `baseUrl` says.
  'base-url-src': {
    // eslint-disable-next-line @typescript-eslint/no-deprecated -- the fixture is about the deprecated option
    baseUrl: 'src',
    paths: {
      '@/components/': ['components/'],
    },
  },
  'paths-multiple': {
    paths: {
      '@/components/*': ['src/components/*', 'src/alternativeComponents/*'],
    },
  },
} as const satisfies ReadonlyRecord<string, ts.CompilerOptions>;

type FixtureName = keyof typeof compilerOptionsByFixture;

/**
 * Reads the compiler options of `fixtureName` in place of a tsconfig.json, or
 * finds none for `undefined`.
 */
const readFixture =
  (fixtureName: FixtureName | undefined) =>
  (): ts.CompilerOptions | undefined =>
    fixtureName === undefined
      ? undefined
      : ({ ...compilerOptionsByFixture[fixtureName] } as const);

const aliasCases = [
  {
    label: '@/components/',
    importPath: '@/components/aaa/bbb',
    expected: 'components/aaa/bbb',
  },
  {
    label: '@/components',
    importPath: '@/components/aaa/bbb',
    expected: 'components/aaa/bbb',
  },
  {
    label: '@/components/*',
    importPath: '@/components/aaa/bbb',
    expected: 'components/aaa/bbb',
  },
] as const;

describe(resolveImportPath, () => {
  test('should resolve relative path', () => {
    expect(
      resolveImportPath('../../components/ui/Text', 'src/pages/aaa/bbb.ts', {}),
    ).toBe('src/components/ui/Text');
  });

  test('should not resolve relative path if relativeFilePath is empty', () => {
    expect(resolveImportPath('../../components/ui/Text', undefined, {})).toBe(
      '../../components/ui/Text',
    );
  });

  test('should do nothing if tsconfig.json does not exist', () => {
    expect(
      resolveImportPath(
        'components/aaa/bbb',
        undefined,
        {},
        readFixture(undefined),
      ),
    ).toBe('components/aaa/bbb');
  });

  test('should do nothing if no paths setting', () => {
    expect(
      resolveImportPath(
        'components/aaa/bbb',
        undefined,
        {},
        readFixture('no-paths'),
      ),
    ).toBe('components/aaa/bbb');
  });

  test.each(aliasCases)(
    'alias $label',
    ({ importPath, expected }: Readonly<(typeof aliasCases)[number]>) => {
      const readCompilerOptions = readFixture('paths-basic');

      expect(
        resolveImportPath(
          'components/aaa/bbb',
          undefined,
          {},
          readCompilerOptions,
        ),
      ).toBe('components/aaa/bbb');

      expect(
        resolveImportPath(importPath, undefined, {}, readCompilerOptions),
      ).toBe(expected);
    },
  );

  test('should ignore baseUrl', () => {
    expect(
      resolveImportPath(
        '@/components/aaa/bbb',
        undefined,
        {},
        readFixture('base-url-src'),
      ),
    ).toBe('components/aaa/bbb');
  });

  test('should resolve path alias with specified index in pathIndexMap', () => {
    expect(
      resolveImportPath(
        '@/components/aaa/bbb',
        undefined,
        { '@/components/*': 1 },
        readFixture('paths-multiple'),
      ),
    ).toBe('src/alternativeComponents/aaa/bbb');
  });

  test('should resolve path alias with default index when specified index does not exist', () => {
    expect(
      resolveImportPath(
        '@/components/aaa/bbb',
        undefined,
        { '@/components/*': 5 },
        readFixture('paths-multiple'),
      ),
    ).toBe('src/components/aaa/bbb');
  });

  test('should resolve path alias with default index when pathIndexMap is empty', () => {
    expect(
      resolveImportPath(
        '@/components/aaa/bbb',
        undefined,
        {},
        readFixture('paths-multiple'),
      ),
    ).toBe('src/components/aaa/bbb');
  });
});

describe(readTsConfig, () => {
  test('should resolve paths from the directory of tsconfig.json', () => {
    expect(
      resolveWithTsconfig(
        { paths: { '@/*': ['./src/*'] } },
        '.',
        '@/components/aaa',
      ),
    ).toBe('src/components/aaa');
  });

  test('should keep a trailing slash of a paths entry', () => {
    expect(
      resolveWithTsconfig(
        { paths: { '@/components/': ['src/components/'] } },
        '.',
        '@/components/aaa',
      ),
    ).toBe('src/components/aaa');
  });

  test('should resolve a paths entry naming the directory of tsconfig.json', () => {
    expect(
      resolveWithTsconfig({ paths: { '@/': ['./'] } }, '.', '@/components/aaa'),
    ).toBe('components/aaa');
  });

  test('should resolve paths from a tsconfig.json found above the working directory', () => {
    expect(
      resolveWithTsconfig(
        { paths: { '@/*': ['./src/*'] } },
        'packages/a',
        '@/components/aaa',
      ),
    ).toBe('../../src/components/aaa');
  });

  test('should resolve paths from the directory of the tsconfig.json declaring them', () => {
    expect(
      resolveWithFiles(
        {
          'configs/tsconfig.base.json': {
            compilerOptions: { paths: { '@/*': ['../src/*'] } },
          },
          'tsconfig.json': {
            extends: './configs/tsconfig.base.json',
            files: [],
          },
        },
        '.',
        '@/components/aaa',
      ),
    ).toBe('src/components/aaa');
  });

  test('should ignore baseUrl', () => {
    expect(
      resolveWithTsconfig(
        {
          baseUrl: 'src',
          ignoreDeprecations: '6.0',
          paths: { '@/*': ['./lib/*'] },
        },
        '.',
        '@/components/aaa',
      ),
    ).toBe('lib/components/aaa');
  });
});

/**
 * Writes `files` (JSON, by path) into a new directory, runs `resolveImportPath`
 * with `readTsConfig` from `cwdSubdirectory` of it, and removes the directory.
 */
const resolveWithFiles = (
  files: ReadonlyRecord<string, unknown>,
  cwdSubdirectory: string,
  importPath: string,
): string => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'resolve-import-path-'));

  try {
    for (const [filePath, content] of Object.entries(files)) {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      fs.mkdirSync(path.dirname(path.join(root, filePath)), {
        recursive: true,
      });

      // eslint-disable-next-line security/detect-non-literal-fs-filename
      fs.writeFileSync(path.join(root, filePath), JSON.stringify(content));
    }

    const cwd = path.join(root, cwdSubdirectory);

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    fs.mkdirSync(cwd, { recursive: true });

    return resolveImportPath(importPath, undefined, {}, () =>
      readTsConfig(cwd),
    );
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
};

const resolveWithTsconfig = (
  compilerOptions: ReadonlyRecord<string, unknown>,
  cwdSubdirectory: string,
  importPath: string,
): string =>
  resolveWithFiles(
    { 'tsconfig.json': { compilerOptions, files: [] } },
    cwdSubdirectory,
    importPath,
  );
