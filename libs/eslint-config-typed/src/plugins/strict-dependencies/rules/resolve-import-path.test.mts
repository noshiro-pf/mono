import * as ts from 'typescript';
import { resolveImportPath } from './resolve-import-path.mjs';

// FIXME: https://github.com/knowledge-work/eslint-plugin-strict-dependencies/tree/v1.3.27 のテストをコピーしてきて
// Codex でテスト・型チェックが通るようにさせただけなので、意味の無いテストになっていないかチェックして修正する

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
type TypeScriptModule = typeof import('typescript');

const actualFunctions = vi.hoisted<{
  findConfigFile?: TypeScriptModule['findConfigFile'];
  getParsedCommandLineOfConfigFile?: TypeScriptModule['getParsedCommandLineOfConfigFile'];
}>(() => ({
  findConfigFile: undefined,
  getParsedCommandLineOfConfigFile: undefined,
}));

vi.mock(import('typescript'), async () => {
  const actual = await vi.importActual<TypeScriptModule>('typescript');
  // eslint-disable-next-line functional/immutable-data
  actualFunctions.findConfigFile = actual.findConfigFile;
  // eslint-disable-next-line functional/immutable-data
  actualFunctions.getParsedCommandLineOfConfigFile =
    actual.getParsedCommandLineOfConfigFile;
  return {
    ...actual,
    findConfigFile: vi.fn(actual.findConfigFile),
    getParsedCommandLineOfConfigFile: vi.fn(
      actual.getParsedCommandLineOfConfigFile,
    ),
  };
});

const mockFindConfigFile = vi.mocked(ts.findConfigFile);
const mockGetParsedCommandLine = vi.mocked(ts.getParsedCommandLineOfConfigFile);

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
    baseUrl: '.',
    paths: {
      '@/components/': ['components/'],
    },
  },
  'base-url-dot-slash': {
    baseUrl: './',
    paths: {
      '@/components/': ['components/'],
    },
  },
  'base-url-parent': {
    baseUrl: '../',
    paths: {
      '@/components/': ['components/'],
    },
  },
  'base-url-src': {
    baseUrl: 'src',
    paths: {
      '@/components/': ['components/'],
    },
  },
  'base-url-dot-src': {
    baseUrl: './src',
    paths: {
      '@/components/': ['components/'],
    },
  },
  'base-url-src-slash': {
    baseUrl: 'src/',
    paths: {
      '@/components/': ['components/'],
    },
  },
  'base-url-dot-src-slash': {
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
} as const satisfies Readonly<Record<string, ts.CompilerOptions>>;

type FixtureName = keyof typeof compilerOptionsByFixture;

const restoreActual = (): void => {
  if (
    actualFunctions.findConfigFile !== undefined &&
    actualFunctions.getParsedCommandLineOfConfigFile !== undefined
  ) {
    mockFindConfigFile.mockImplementation(actualFunctions.findConfigFile);
    mockGetParsedCommandLine.mockImplementation(
      actualFunctions.getParsedCommandLineOfConfigFile,
    );
  }
};

const useFixture = (fixtureName: FixtureName | undefined): void => {
  restoreActual();

  if (fixtureName === undefined) {
    return;
  }

  const compilerOptions = compilerOptionsByFixture[fixtureName];
  mockFindConfigFile.mockImplementation(() => 'tsconfig.json');
  mockGetParsedCommandLine.mockImplementation(() => ({
    options: { ...compilerOptions },
    fileNames: [],
    errors: [],
  }));
};

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
    useFixture(undefined);

    expect(resolveImportPath('components/aaa/bbb', undefined, {})).toBe(
      'components/aaa/bbb',
    );
  });

  test('should do nothing if no paths setting', () => {
    useFixture('no-paths');

    expect(resolveImportPath('components/aaa/bbb', undefined, {})).toBe(
      'components/aaa/bbb',
    );

    useFixture(undefined);
  });

  test.each(aliasCases)(
    'alias $label',
    ({ importPath, expected }: Readonly<(typeof aliasCases)[number]>) => {
      useFixture('paths-basic');

      expect(resolveImportPath('components/aaa/bbb', undefined, {})).toBe(
        'components/aaa/bbb',
      );
      expect(resolveImportPath(importPath, undefined, {})).toBe(expected);

      useFixture(undefined);
    },
  );

  test.each(baseUrlCases)(
    'baseUrl $fixtureName',
    ({ fixtureName, expected }: Readonly<(typeof baseUrlCases)[number]>) => {
      useFixture(fixtureName);

      expect(resolveImportPath('components/aaa/bbb', undefined, {})).toBe(
        'components/aaa/bbb',
      );
      expect(resolveImportPath('@/components/aaa/bbb', undefined, {})).toBe(
        expected,
      );

      useFixture(undefined);
    },
  );

  test('should resolve path alias with specified index in pathIndexMap', () => {
    useFixture('paths-multiple');

    expect(
      resolveImportPath('@/components/aaa/bbb', undefined, {
        '@/components/*': 1,
      }),
    ).toBe('src/alternativeComponents/aaa/bbb');

    useFixture(undefined);
  });

  test('should resolve path alias with default index when specified index does not exist', () => {
    useFixture('paths-multiple');

    expect(
      resolveImportPath('@/components/aaa/bbb', undefined, {
        '@/components/*': 5,
      }),
    ).toBe('src/components/aaa/bbb');

    useFixture(undefined);
  });

  test('should resolve path alias with default index when pathIndexMap is empty', () => {
    useFixture('paths-multiple');

    expect(resolveImportPath('@/components/aaa/bbb', undefined, {})).toBe(
      'src/components/aaa/bbb',
    );

    useFixture(undefined);
  });
});
