import * as prettier from 'prettier';
import { codeFromStringLines } from '../utils/index.mjs';
import { tsfmt } from './tsfmt.mjs';

describe('tsfmt', () => {
  describe('Valid', () => {
    test.each([
      {
        description: 'No change',
        source: 'const a: number = 1;',
        expected: 'const a: number = 1;',
        debug: false as boolean,
      },
      {
        description: 'Comments in function arguments without trailing comma',
        source: codeFromStringLines(
          '/** f */',
          'const f = (',
          '  /* description1 */',
          '  arg1: number, // line-comment-1',
          '  /* description2 */',
          '  arg2: number // line-comment-2',
          '  /* params-end */',
          '): /* ret */ number[] /* => */ => [];',
          '// f end',
          '',
          '',
          '',
          '',
          '',
          '// file end',
        ),
        expected: codeFromStringLines(
          '/** f */',
          'const f = (',
          '  /* description1 */',
          '  arg1: number, // line-comment-1',
          '  /* description2 */',
          '  arg2: number // line-comment-2',
          '  /* params-end */',
          '): /* ret */ number[] /* => */ => [];',
          '// f end',
          '',
          '// file end',
        ),
      },
      {
        description: 'Comments in function arguments with trailing comma',
        source: codeFromStringLines(
          '/** f */',
          'const f = (',
          '  /* description1 */',
          '  arg1: number, // line-comment-1',
          '  /* description2 */',
          '  arg2: number, // line-comment-2',
          '  /* params-end */',
          '): /* ret */ number[] /* => */ => [];',
          '// f end',
          '',
          '',
          '',
          '',
          '',
          '// file end',
        ),
        expected: codeFromStringLines(
          '/** f */',
          'const f = (',
          '  /* description1 */',
          '  arg1: number, // line-comment-1',
          '  /* description2 */',
          '  arg2: number, // line-comment-2',
          '  /* params-end */',
          '): /* ret */ number[] /* => */ => [];',
          '// f end',
          '',
          '// file end',
        ),
        debug: true,
      },
      {
        description: 'Trivia 2',
        source: codeFromStringLines(
          'const f = (',
          '  arg1: number,',
          '  arg2: number,',
          '): void => [];',
          '',
          '',
          '/** f */',
          '',
          '',
          '',
          'const g = (',
          '  arg1: number,',
          '  arg2: number,',
          '): void => [];',
        ),
        expected: codeFromStringLines(
          'const f = (',
          '  arg1: number,',
          '  arg2: number,',
          '): void => [];',
          '',
          '',
          '/** f */',
          '',
          '',
          '',
          'const g = (',
          '  arg1: number,',
          '  arg2: number,',
          '): void => [];',
        ),
      },
      {
        description: 'Trivia 3',
        source: codeFromStringLines(
          'namespace TestCode {',
          '  // Combined example',
          '  type ComplexData = {',
          '    id: number;',
          '    values: any[]; // any -> unknown, array -> readonly',
          '    settings: {',
          '      enabled: boolean;',
          '      thresholds: number[]; // array -> readonly',
          '    };',
          '  };',
          '',
          '  export const initialData: ComplexData[] = [',
          '    // array -> readonly',
          '    {',
          '      id: 1,',
          "      values: [10, 'any', true as const], // any -> unknown, primitive as const removed",
          '      settings: { enabled: true, thresholds: [0.5, 0.8] },',
          '    },',
          '  ]; // append as const to outer array',
          '}',
        ),
        expected: codeFromStringLines(
          'namespace TestCode {',
          '  // Combined example',
          '  type ComplexData = {',
          '    id: number;',
          '    values: any[]; // any -> unknown, array -> readonly',
          '    settings: {',
          '      enabled: boolean;',
          '      thresholds: number[]; // array -> readonly',
          '    };',
          '  };',
          '',
          '  export const initialData: ComplexData[] = [',
          '    // array -> readonly',
          '    {',
          '      id: 1,',
          "      values: [10, 'any', true as const], // any -> unknown, primitive as const removed",
          '      settings: { enabled: true, thresholds: [0.5, 0.8] },',
          '    },',
          '  ]; // append as const to outer array',
          '}',
        ),
      },
    ] as const satisfies {
      source: string;
      expected: string;
      description: string;
      debug?: boolean;
    }[])('$description', async ({ expected, source, debug }) => {
      if (debug !== true) {
        // eslint-disable-next-line vitest/no-restricted-vi-methods
        vi.spyOn(console, 'debug').mockImplementation(() => {});
      }

      const transformed = tsfmt('source.ts', source);

      const transformedFormatted = await prettier.format(transformed, {
        parser: 'typescript',
      });
      const expectedFormatted = await prettier.format(expected, {
        parser: 'typescript',
      });

      expect(transformedFormatted).toBe(expectedFormatted);
    });
  });
});
