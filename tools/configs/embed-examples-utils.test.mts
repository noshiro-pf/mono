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

  test('keeps every range between an ignore-above and the next ignore-below, a blank line apart', () => {
    const sample = [
      "import { x } from './x.mjs';",
      '{',
      '  // embed-sample-code-ignore-above',
      '  // ❌',
      '  const a = x;',
      '  // embed-sample-code-ignore-below',
      '',
      '  expect(a).toBe(x);',
      '}',
      '',
      '{',
      '  // embed-sample-code-ignore-above',
      '  // ✅',
      '  const b = x;',
      '',
      '  // embed-sample-code-ignore-below',
      '  expect(b).toBe(x);',
      '}',
    ].join('\n');

    assert.deepStrictEqual(
      extractSampleCode(sample),
      ['// ❌', 'const a = x;', '', '// ✅', 'const b = x;'].join('\n'),
    );
  });

  test('removes the indentation of each range on its own', () => {
    const sample = [
      '    const a = 1;',
      '// embed-sample-code-ignore-below',
      'hidden();',
      '// embed-sample-code-ignore-above',
      '  const b = 2;',
      '  if (b === 2) {',
      '    console.log(b);',
      '  }',
    ].join('\n');

    assert.deepStrictEqual(
      extractSampleCode(sample),
      [
        'const a = 1;',
        '',
        'const b = 2;',
        'if (b === 2) {',
        '  console.log(b);',
        '}',
      ].join('\n'),
    );
  });

  test('drops a range that holds only ignored lines', () => {
    const sample = [
      '// embed-sample-code-ignore-above',
      'const a = 1;',
      '// embed-sample-code-ignore-below',
      'hidden();',
      '// embed-sample-code-ignore-above',
      '/* embed-sample-code-ignore-this-line */ hidden();',
      '// embed-sample-code-ignore-below',
    ].join('\n');

    assert.deepStrictEqual(extractSampleCode(sample), 'const a = 1;');
  });

  test.each([
    ['ignore-above', 'ignore-above'],
    ['ignore-below', 'ignore-below'],
  ] as const)('throws on an %s marker followed by another', (first, second) => {
    const sample = [
      'const a = 1;',
      `// embed-sample-code-${first}`,
      'const b = 2;',
      `// embed-sample-code-${second}`,
      'const c = 3;',
    ].join('\n');

    assert.throws(() => extractSampleCode(sample), /lines 2 and 4/u);
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
