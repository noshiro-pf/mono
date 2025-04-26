import { pipe } from '@noshiro/ts-utils';
import * as ts from 'typescript';

export const testPreprocess = (
  transformerFactory: ts.TransformerFactory<ts.SourceFile>,
  source: string,
  expected: string,
  debug: boolean,
): Readonly<{ result: string; expectedFormatted: string }> => {
  if (!debug) {
    // eslint-disable-next-line vitest/no-restricted-vi-methods
    vi.spyOn(console, 'debug').mockImplementation(() => {});

    // eslint-disable-next-line vitest/no-restricted-vi-methods
    vi.spyOn(console, 'log').mockImplementation(() => {});
  }

  const sourceAst = ts.createSourceFile(
    'source.ts',
    source,
    ts.ScriptTarget.Latest, // Target ECMAScript version
    true, // setParentNodes: true - Maintain parent-child relationships between nodes
  );

  const expectedAst = ts.createSourceFile(
    'expected.ts',
    expected,
    ts.ScriptTarget.Latest, // Target ECMAScript version
    true, // setParentNodes: true - Maintain parent-child relationships between nodes
  );

  const transformedAst = pipe(
    ts.transform(sourceAst, [transformerFactory]),
  ).chain(
    (transformationResult) =>
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      transformationResult.transformed[0]!,
  ).value;

  const printer = ts.createPrinter({
    newLine: ts.NewLineKind.LineFeed,
    removeComments: false,
  });

  const printedTransformed = printer.printFile(transformedAst);
  const printedExpected = printer.printFile(expectedAst);

  return {
    expectedFormatted: printedExpected,
    result: printedTransformed,
  };
};
