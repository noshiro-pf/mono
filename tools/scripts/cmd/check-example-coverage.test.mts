import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import { Result } from 'ts-data-forge';
import { embedExamplesInJsDoc } from '../../configs/embed-examples-in-jsdoc.mjs';
import { checkPackageExampleCoverage } from './check-example-coverage.mjs';

describe('example coverage source extensions', () => {
  test.each(['component.mts', 'component.tsx'] as const)(
    'requires embedder wiring for examples in %s',
    async (fileName) => {
      await withSource(fileName, async (packageRootPath) => {
        const result = await checkPackageExampleCoverage(packageRootPath);

        assert.isTrue(Result.isOk(result));

        expect(result.value.hasExamples).toBe(true);

        expect(result.value.violation?.detail).toContain(
          'no scripts/cmd/embed-examples-in-jsdoc.mts',
        );
      });
    },
  );

  test.each(['component.mts', 'component.tsx'] as const)(
    'rejects an unmapped example in %s',
    async (fileName) => {
      await withSource(fileName, async (packageRootPath) => {
        const result = await embedExamplesInJsDoc({
          packageRootPath,
          sourceFileMappings: [],
        });

        assert.isTrue(Result.isErr(result));

        expect(result.value).toContain(fileName);
      });
    },
  );

  test.each(['component.test.mts', 'component.test.tsx'] as const)(
    'exempts examples inside %s from both checks',
    async (fileName) => {
      await withSource(fileName, async (packageRootPath) => {
        const coverage = await checkPackageExampleCoverage(packageRootPath);

        const embedding = await embedExamplesInJsDoc({
          packageRootPath,
          sourceFileMappings: [],
        });

        assert.isTrue(Result.isOk(coverage));

        expect(coverage.value).toStrictEqual({
          hasExamples: false,
          violation: undefined,
        });

        assert.isTrue(Result.isOk(embedding));
      });
    },
  );

  test('embeds a mapped TSX example from its sample', async () => {
    await withSource('component.tsx', async (packageRootPath) => {
      const sourcePath = path.join(packageRootPath, 'src/component.tsx');

      const samplePath = path.join(packageRootPath, 'sample.mts');

      // eslint-disable-next-line security/detect-non-literal-fs-filename -- Files belong to this test's temporary package.
      await fs.writeFile(
        sourcePath,
        [
          '/**',
          ' * @example',
          ' * ```ts',
          ' * const before = 0;',
          ' * ```',
          ' */',
          'export const Component = () => <div />;',
          '',
        ].join('\n'),
      );

      // eslint-disable-next-line security/detect-non-literal-fs-filename -- Sample path belongs to this test's temporary package.
      await fs.writeFile(samplePath, 'const after = 1;\n');

      const result = await embedExamplesInJsDoc({
        packageRootPath,
        sourceFileMappings: [
          { sourcePath: 'src/component.tsx', sampleFiles: ['sample.mts'] },
        ],
      });

      assert.isTrue(Result.isOk(result));

      // eslint-disable-next-line security/detect-non-literal-fs-filename -- Read back the same fixture whose sample was embedded.
      const embedded = await fs.readFile(sourcePath, 'utf8');

      expect(embedded).toContain('const after = 1;');

      expect(embedded).not.toContain('const before = 0;');

      expect(embedded).toContain('<div />');
    });
  });
});

const withSource = async (
  fileName: string,
  run: (root: string) => Promise<void>,
): Promise<void> => {
  const packageRootPath = await fs.mkdtemp(
    path.join(os.tmpdir(), 'example-coverage-'),
  );

  try {
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- Source directory is inside the newly created temporary package.
    await fs.mkdir(path.join(packageRootPath, 'src'));

    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await fs.writeFile(
      path.join(packageRootPath, 'src', fileName),
      [
        '/**',
        ' * @example',
        ' * const example = 1;',
        ' */',
        'export const component = 1;',
        '',
      ].join('\n'),
    );

    await run(packageRootPath);
  } finally {
    await fs.rm(packageRootPath, { recursive: true, force: true });
  }
};
