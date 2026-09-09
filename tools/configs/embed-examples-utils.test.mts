import { extractSampleCode } from './embed-examples-utils.mjs';

/**
 * The fixtures are written as arrays of lines rather than as `dedent`
 * literals: what every case here is about is leading whitespace, which
 * `dedent` exists to remove.
 */
describe('extractSampleCode', () => {
  test('keeps a sample that carries no marker, trimmed', () => {
    const sample = ['', 'const a = 1;', '', 'console.log(a);', ''].join('\n');

    assert.deepStrictEqual(
      extractSampleCode(sample),
      'const a = 1;\n\nconsole.log(a);',
    );
  });

  test('drops everything above the ignore-above marker', () => {
    const sample = [
      "import { x } from './x.mjs';",
      '// embed-sample-code-ignore-above',
      'const a = x;',
    ].join('\n');

    assert.deepStrictEqual(extractSampleCode(sample), 'const a = x;');
  });

  test('drops everything below the ignore-below marker', () => {
    const sample = [
      'const a = 1;',
      '// embed-sample-code-ignore-below',
      'expect(a).toBe(1);',
    ].join('\n');

    assert.deepStrictEqual(extractSampleCode(sample), 'const a = 1;');
  });

  test('drops a line that starts with the ignore-this-line marker', () => {
    const sample = [
      '/* embed-sample-code-ignore-this-line */ const hidden = 1;',
      'const shown = 2;',
    ].join('\n');

    assert.deepStrictEqual(extractSampleCode(sample), 'const shown = 2;');
  });

  test('removes the indentation common to every non-blank line', () => {
    const sample = [
      '    const a = 1;',
      '',
      '    if (a === 1) {',
      '      console.log(a);',
      '    }',
    ].join('\n');

    assert.deepStrictEqual(
      extractSampleCode(sample),
      ['const a = 1;', '', 'if (a === 1) {', '  console.log(a);', '}'].join(
        '\n',
      ),
    );
  });

  test('keeps a codemod directive by default', () => {
    const sample = ['// transformer-ignore-next-line', 'const a = 1;'].join(
      '\n',
    );

    assert.deepStrictEqual(extractSampleCode(sample), sample);
  });

  test('drops a codemod directive under stripTransformerDirectives', () => {
    const sample = ['// transformer-ignore-next-line', 'const a = 1;'].join(
      '\n',
    );

    assert.deepStrictEqual(
      extractSampleCode(sample, { stripTransformerDirectives: true }),
      'const a = 1;',
    );
  });
});
