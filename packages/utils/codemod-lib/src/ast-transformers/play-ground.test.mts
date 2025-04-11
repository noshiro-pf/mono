import { pipe } from '@noshiro/ts-utils';
import * as ts from 'typescript';
import {
  codeFromStringLines,
  createTransformerFactory,
  testPreprocess,
} from '../index.mjs';

test('playground', () => {
  const source = codeFromStringLines(
    //
    '',
    '[0];',
    '/* aaa */',
    '// [1]',
    '[1];',
    '',
    '/* bbb */',
    '// [2]',
    '[2];',
    '// [3]',
    '[3];',
  );

  const expected = codeFromStringLines(
    //
    '',
    '[1];',
    '/* aaa */',
    '// [1]',
    '[2];',
    '',
    '/* bbb */',
    '// [2]',
    '[3];',
    '// [3]',
    '[4];',
  );

  const { expectedFormatted, result } = testPreprocess(
    createTransformerFactory((context) => {
      const visitor: ts.Visitor = (node: ts.Node): ts.VisitResult<ts.Node> =>
        ts.isNumericLiteral(node)
          ? pipe(Number.parseInt(node.text, 10) + 1).chain((incrementedValue) =>
              context.factory.createNumericLiteral(incrementedValue.toString()),
            ).value
          : ts.visitEachChild(node, visitor, context);

      return visitor;
    }),
    source,
    expected,
    true,
  );

  expect(result).toBe(expectedFormatted);
});
