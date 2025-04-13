import * as ts from 'typescript';
import { createTransformerFactory } from '../utils/index.mjs';
import { astTransformerToStringTransformer } from './ast-transformer-to-string-transformer.mjs';

const noopTransformer: ts.TransformerFactory<ts.SourceFile> =
  createTransformerFactory((context) => {
    const visitor: ts.Visitor = (node: ts.Node): ts.VisitResult<ts.Node> =>
      ts.visitEachChild(node, visitor, context);

    return visitor;
  });

const transformer = astTransformerToStringTransformer([noopTransformer]);

describe('astTransformerToStringTransformer', () => {
  describe('Valid', () => {
    test('No change', () => {
      expect(transformer('const a: number = 1;')).toBe(
        'const a: number = 1;\n',
      );
    });
  });

  describe('Invalid', () => {
    test('Syntax errors', () => {
      expect(() => transformer('type A = { a: number;')).toThrow(
        new Error('There is a syntax error in the source'),
      );
    });
  });
});
