import * as prettier from 'prettier';
import 'zx/globals';
import {
  appendAsConstTransformer,
  convertToReadonlyTypeTransformer,
  replaceAnyWithUnknownTransformer,
  transformSourceCode,
} from '../src/index.mjs';

describe('E2E test', () => {
  test('E2E test', async () => {
    vi.spyOn(console, 'debug').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});

    const filepaths = {
      source: path.resolve(import.meta.dirname, './source.mts'),
      expected: path.resolve(import.meta.dirname, './expected.mts'),
    };

    const options = await prettier.resolveConfig(filepaths.source);

    const source = await fs.readFile(filepaths.source, { encoding: 'utf8' });

    const sourceFormatted = await prettier.format(source, {
      ...options,
      filepath: filepaths.expected,
    });

    const converted = transformSourceCode(sourceFormatted, false, [
      replaceAnyWithUnknownTransformer,
      appendAsConstTransformer(),
      convertToReadonlyTypeTransformer(),
    ]);

    const convertedFormatted = await formatter(converted);

    const expected = await fs.readFile(filepaths.expected, {
      encoding: 'utf8',
    });

    const expectedFormatted = await formatter(expected);

    expect(convertedFormatted).toBe(expectedFormatted);
  });
});

const formatter = async (code: string): Promise<string> => {
  const formatOnce = await prettier.format(code, {
    parser: 'typescript',
  });

  const whitespaceNormalized = normalizeWhitespaceForComparison(formatOnce);

  return prettier.format(whitespaceNormalized, {
    parser: 'typescript',
  });
};

/**
 * Normalizes whitespace in a code string, primarily for comparing AST structure outputs.
 * - Preserves newlines immediately following line comments (`//`).
 * - Collapses other sequences of whitespace (including newlines) into a single space.
 * - WARNING: Does NOT handle Automatic Semicolon Insertion (ASI) correctly.
 *            Code relying on ASI may break if this function is used for general transformation.
 * - WARNING: Does NOT preserve formatting within block comments or template literals.
 *
 * @param code The input TypeScript code string.
 * @returns The code string with normalized whitespace.
 */
const normalizeWhitespaceForComparison = (code: string): string => {
  // Use a placeholder unlikely to appear in the code
  const placeholder = '___LINE_COMMENT_NEWLINE_PLACEHOLDER___';

  // 1. Protect newlines immediately following line comments
  const protectedCode = code.replaceAll(/(\/\/.*?)\r?\n/gu, `$1${placeholder}`);

  // 2. Collapse multiple whitespace characters (including unprotected newlines) into a single space
  const collapsedCode = protectedCode.replaceAll('\n', ' ');

  // 3. Restore the newlines after line comments
  const finalCode = collapsedCode.replaceAll(placeholder, '\n');

  // 4. Trim leading/trailing whitespace
  return finalCode.trim();
};
