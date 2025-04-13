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

    const converted = transformSourceCode(
      sourceFormatted,
      [
        replaceAnyWithUnknownTransformer,
        appendAsConstTransformer(),
        convertToReadonlyTypeTransformer(),
      ],
      { ext: '.mts' },
    );

    const convertedFormatted = await prettier.format(converted, {
      ...options,
      filepath: filepaths.expected,
    });

    const expected = await fs.readFile(filepaths.expected, {
      encoding: 'utf8',
    });

    const expectedFormatted = await prettier.format(expected, {
      ...options,
      filepath: filepaths.expected,
    });

    expect(convertedFormatted).toBe(expectedFormatted);
  });
});
