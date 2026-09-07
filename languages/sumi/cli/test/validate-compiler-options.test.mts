import {
  lockedCompilerOptions,
  validateCompilerOptions,
} from '../src/index.mjs';

describe(validateCompilerOptions, () => {
  test('accepts the locked options verbatim', () => {
    assert.deepStrictEqual(validateCompilerOptions(lockedCompilerOptions), []);
  });

  test('reports a locked option set to another value', () => {
    assert.deepStrictEqual(
      validateCompilerOptions({ ...lockedCompilerOptions, strict: false }),
      [{ option: 'strict', expected: true, actual: false }],
    );
  });

  test('reports a locked `true` option that is absent', () => {
    const { strict: _strict, ...rest } = lockedCompilerOptions;

    assert.deepStrictEqual(validateCompilerOptions(rest), [
      { option: 'strict', expected: true, actual: undefined },
    ]);
  });

  test('accepts an absent `false` option whose absence is the default', () => {
    const {
      exactOptionalPropertyTypes: _e,
      allowJs: _a,
      ...rest
    } = lockedCompilerOptions;

    assert.deepStrictEqual(validateCompilerOptions(rest), []);
  });

  test('reports an absent `false` option whose absence means "suggestion"', () => {
    const { allowUnusedLabels: _l, ...rest } = lockedCompilerOptions;

    assert.deepStrictEqual(validateCompilerOptions(rest), [
      { option: 'allowUnusedLabels', expected: false, actual: undefined },
    ]);
  });

  test('compares enum values case-insensitively', () => {
    assert.deepStrictEqual(
      validateCompilerOptions({
        ...lockedCompilerOptions,
        module: 'NodeNext',
        moduleResolution: 'NodeNext',
      }),
      [],
    );
  });

  test('reports a strict-family flag turned off under strict', () => {
    assert.deepStrictEqual(
      validateCompilerOptions({
        ...lockedCompilerOptions,
        noImplicitAny: false,
      }),
      [{ option: 'noImplicitAny', expected: true, actual: false }],
    );
  });

  test('ignores free options', () => {
    assert.deepStrictEqual(
      validateCompilerOptions({
        ...lockedCompilerOptions,
        lib: ['esnext', 'dom'],
        target: 'es2022',
        jsxImportSource: 'preact',
        noEmit: false,
        outDir: 'dist',
      }),
      [],
    );
  });
});
