import * as prettier from 'prettier';
import * as ts from 'typescript';
import {
  codeFromStringLines,
  createTransformerFactory,
  printNode,
} from '../utils/index.mjs';
import { transformSourceCode } from './transform-source-code.mjs';

const noopTransformer: ts.TransformerFactory<ts.SourceFile> =
  createTransformerFactory((context) => {
    const visitor: ts.Visitor = (node: ts.Node): ts.VisitResult<ts.Node> => {
      console.debug(`[${ts.SyntaxKind[node.kind]}] ${printNode(node)}\n`);

      return ts.visitEachChild(node, visitor, context);
    };

    return visitor;
  });

describe('astTransformerToStringTransformer', () => {
  describe('Valid', () => {
    test('No change', () => {
      // eslint-disable-next-line vitest/no-restricted-vi-methods
      vi.spyOn(console, 'debug').mockImplementation(() => {});

      const transformed = transformSourceCode('const a: number = 1;', [
        noopTransformer,
      ]);

      expect(transformed).toBe('const a: number = 1;\n');
    });

    test('Trivia', async () => {
      // eslint-disable-next-line vitest/no-restricted-vi-methods
      vi.spyOn(console, 'debug').mockImplementation(() => {});

      const src = codeFromStringLines(
        '/** f */',
        'const f = (',
        '  /* arg1 */',
        '  arg1: number,',
        '  /* arg2 */',
        '  arg2: number, // after arg2',
        '  /* end */',
        '): /* void */ void /* => */ => [];',
      );

      const expected = codeFromStringLines(
        '/** f */',
        'const f = (',
        '  /* arg1 */',
        '  arg1: number,',
        '  /* arg2 */',
        '  arg2: number,', //  // after arg2 is removed ... 🙁
        // '  /* end */', // This line is removed ... 🙁
        '): void /* => */ => [];', // /* void */ is removed ... 🙁
      );

      const transformed = transformSourceCode(src, [noopTransformer]);

      const resultFormatted = await prettier.format(transformed, {
        parser: 'typescript',
      });
      const expectedFormatted = await prettier.format(expected, {
        parser: 'typescript',
      });

      expect(resultFormatted).toBe(expectedFormatted);
    });
  });

  test('Trivia 2', async () => {
    // eslint-disable-next-line vitest/no-restricted-vi-methods
    vi.spyOn(console, 'debug').mockImplementation(() => {});

    const src = codeFromStringLines(
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
    );

    const expected = codeFromStringLines(
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
    );

    const transformed = transformSourceCode(src, [noopTransformer]);

    const resultFormatted = await prettier.format(transformed, {
      parser: 'typescript',
    });
    const expectedFormatted = await prettier.format(expected, {
      parser: 'typescript',
    });

    expect(resultFormatted).toBe(expectedFormatted);
  });

  describe('Invalid', () => {
    test('Syntax errors', () => {
      // eslint-disable-next-line vitest/no-restricted-vi-methods
      vi.spyOn(console, 'debug').mockImplementation(() => {});
      // eslint-disable-next-line vitest/no-restricted-vi-methods
      vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() =>
        transformSourceCode('type A = { a: number;', [noopTransformer]),
      ).toThrow(new Error('There is a syntax error in the source'));
    });
  });
});
