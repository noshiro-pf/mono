import type { ReadonlyRecord } from 'ts-type-forge';
import type * as ts from 'typescript';
import { resolveImportPath } from './resolve-import-path.mjs';

// FIXME: https://github.com/knowledge-work/eslint-plugin-strict-dependencies/tree/v1.3.27 のテストをコピーしてきて
// Codex でテスト・型チェックが通るようにさせただけなので、意味の無いテストになっていないかチェックして修正する

// `baseUrl` is deprecated in TypeScript 6.0, but the rule still resolves legacy
// `baseUrl`-relative `paths`, so the fixtures below have to set it.
const compilerOptionsByFixture = {
  'no-paths': {},
  'paths-basic': {
    paths: {
      '@/components/': ['components/'],
      '@/components': ['components'],
      '@/components/*': ['components/*'],
    },
  },
  'base-url-dot': {
    // eslint-disable-next-line @typescript-eslint/no-deprecated -- see the note above the table
    baseUrl: '.',
    paths: {
      '@/components/': ['components/'],
    },
  },
  'base-url-dot-slash': {
    // eslint-disable-next-line @typescript-eslint/no-deprecated -- see the note above the table
    baseUrl: './',
    paths: {
      '@/components/': ['components/'],
    },
  },
  'base-url-parent': {
    // eslint-disable-next-line @typescript-eslint/no-deprecated -- see the note above the table
    baseUrl: '../',
    paths: {
      '@/components/': ['components/'],
    },
  },
  'base-url-src': {
    // eslint-disable-next-line @typescript-eslint/no-deprecated -- see the note above the table
    baseUrl: 'src',
    paths: {
      '@/components/': ['components/'],
    },
  },
  'base-url-dot-src': {
    // eslint-disable-next-line @typescript-eslint/no-deprecated -- see the note above the table
    baseUrl: './src',
    paths: {
      '@/components/': ['components/'],
    },
  },
  'base-url-src-slash': {
    // eslint-disable-next-line @typescript-eslint/no-deprecated -- see the note above the table
    baseUrl: 'src/',
    paths: {
      '@/components/': ['components/'],
    },
  },
  'base-url-dot-src-slash': {
    // eslint-disable-next-line @typescript-eslint/no-deprecated -- see the note above the table
    baseUrl: './src/',
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

const baseUrlCases = [
  {
    fixtureName: 'base-url-dot',
    expected: 'components/aaa/bbb',
  },
  {
    fixtureName: 'base-url-dot-slash',
    expected: 'components/aaa/bbb',
  },
  {
    fixtureName: 'base-url-parent',
    expected: '../components/aaa/bbb',
  },
  {
    fixtureName: 'base-url-src',
    expected: 'src/components/aaa/bbb',
  },
  {
    fixtureName: 'base-url-dot-src',
    expected: 'src/components/aaa/bbb',
  },
  {
    fixtureName: 'base-url-src-slash',
    expected: 'src/components/aaa/bbb',
  },
  {
    fixtureName: 'base-url-dot-src-slash',
    expected: 'src/components/aaa/bbb',
  },
] as const satisfies readonly Readonly<{
  fixtureName: FixtureName;
  expected: string;
}>[];

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

  test.each(baseUrlCases)(
    'baseUrl $fixtureName',
    ({ fixtureName, expected }: Readonly<(typeof baseUrlCases)[number]>) => {
      const readCompilerOptions = readFixture(fixtureName);

      expect(
        resolveImportPath(
          'components/aaa/bbb',
          undefined,
          {},
          readCompilerOptions,
        ),
      ).toBe('components/aaa/bbb');

      expect(
        resolveImportPath(
          '@/components/aaa/bbb',
          undefined,
          {},
          readCompilerOptions,
        ),
      ).toBe(expected);
    },
  );

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
