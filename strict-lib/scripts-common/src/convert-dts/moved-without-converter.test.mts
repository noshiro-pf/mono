import { movedWithoutConverter } from './moved-without-converter.mjs';

/** Lib files with no stub among them. */
const libFiles = (
  ...filenames: readonly string[]
): readonly Readonly<{ filename: string; content: string }>[] =>
  filenames.map((filename) => ({ filename, content: 'interface X {}' }));

describe(movedWithoutConverter, () => {
  test('reports a registered file whose feature moved to an unregistered edition', () => {
    assert.deepStrictEqual(
      movedWithoutConverter(
        ['lib.es5.d.ts', 'lib.esnext.float16.d.ts'],
        libFiles('lib.es5.d.ts', 'lib.es2025.float16.d.ts'),
      ),
      [
        {
          registered: 'lib.esnext.float16.d.ts',
          present: 'lib.es2025.float16.d.ts',
        },
      ],
    );
  });

  test('reports nothing once the new name is registered too', () => {
    assert.deepStrictEqual(
      movedWithoutConverter(
        ['lib.esnext.float16.d.ts', 'lib.es2025.float16.d.ts'],
        libFiles('lib.es2025.float16.d.ts'),
      ),
      [],
    );
  });

  test('reports nothing for a registered file absent with no file of its feature', () => {
    assert.deepStrictEqual(
      movedWithoutConverter(
        ['lib.esnext.float16.d.ts', 'lib.es2024.arraybuffer.d.ts'],
        libFiles('lib.es5.d.ts', 'lib.es2015.core.d.ts'),
      ),
      [],
    );
  });

  test('reports nothing for a registered file that is present', () => {
    assert.deepStrictEqual(
      movedWithoutConverter(
        ['lib.es2017.date.d.ts'],
        libFiles('lib.es2017.date.d.ts', 'lib.es2020.date.d.ts'),
      ),
      [],
    );
  });

  test('never matches a name with no feature after its edition', () => {
    // `lib.es5.d.ts` and `lib.es2015.d.ts` are editions, not features.
    assert.deepStrictEqual(
      movedWithoutConverter(['lib.es5.d.ts'], libFiles('lib.es2015.d.ts')),
      [],
    );

    // `lib.dom.d.ts` has no edition at all.
    assert.deepStrictEqual(
      movedWithoutConverter(
        ['lib.dom.d.ts'],
        libFiles('lib.webworker.d.ts', 'lib.dom.iterable.d.ts'),
      ),
      [],
    );
  });

  test('reports every unregistered file of the feature', () => {
    assert.deepStrictEqual(
      movedWithoutConverter(
        ['lib.es2022.sharedmemory.d.ts'],
        libFiles(
          'lib.es2024.sharedmemory.d.ts',
          'lib.esnext.sharedmemory.d.ts',
        ),
      ),
      [
        {
          registered: 'lib.es2022.sharedmemory.d.ts',
          present: 'lib.es2024.sharedmemory.d.ts',
        },
        {
          registered: 'lib.es2022.sharedmemory.d.ts',
          present: 'lib.esnext.sharedmemory.d.ts',
        },
      ],
    );
  });

  test('counts a registered file kept as a stub as absent', () => {
    assert.deepStrictEqual(
      movedWithoutConverter(
        ['lib.esnext.iterator.d.ts'],
        [
          {
            filename: 'lib.esnext.iterator.d.ts',
            content:
              "// This file's contents are now included in the main types file.",
          },
          { filename: 'lib.es2026.iterator.d.ts', content: 'interface X {}' },
        ],
      ),
      [
        {
          registered: 'lib.esnext.iterator.d.ts',
          present: 'lib.es2026.iterator.d.ts',
        },
      ],
    );
  });
});
