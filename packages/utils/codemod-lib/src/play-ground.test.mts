import { ts } from 'ts-morph';
import { codeFromStringLines, testFn } from './index.mjs';

test('playground', async () => {
  const source = codeFromStringLines(
    //
    '',
    '[0];',
    '/* aaa */',
    '// [1]',
    '[1];',
    '',
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
    '',
    '/* bbb */',
    '// [2]',
    '[3];',
    '// [3]',
    '[4];',
  );

  const { expectedFormatted, result } = await testFn(
    (sourceFile) =>
      sourceFile.transform((traversal) => {
        const node: ts.Node = traversal.visitChildren();
        // try {
        //   console.log(`"${node.getFullText()}"`);
        //   console.log(`"${node.getText()}"`);
        // } catch {}
        if (ts.isNumericLiteral(node)) {
          const incrementedValue = Number.parseInt(node.text, 10) + 1;
          return traversal.factory.createNumericLiteral(
            incrementedValue.toString(),
          );
        }

        return node;
      }),
    source,
    expected,
    true,
  );

  expect(result).toBe(expectedFormatted);
});
