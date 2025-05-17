import * as ts from 'typescript';
import { printNode } from '../utils/index.mjs';

export const toUnionAndIntersectionTestCase = ({
  title,
  testCase,
}: Readonly<{
  title: (op: 'Union' | 'Intersection') => string;
  testCase: (op: '|' | '&') => { source: string; expected: string };
}>): readonly Readonly<{
  name: string;
  source: string;
  expected: string;
}>[] =>
  (['|', '&'] as const).map((op) => ({
    name: title(op === '&' ? 'Intersection' : 'Union'),
    ...testCase(op),
  }));

export const debugPrintWrapper = <N extends ts.Node>(
  message: string,
  nodeBefore: ts.Node,
  nodeAfter: N,
  depth: SafeUintWithSmallInt,
  additionalMsg?: string,
): N => {
  const indent = '  '.repeat(depth);

  console.debug(
    `${indent}${message}  [${ts.SyntaxKind[nodeBefore.kind]}]  ->  [${ts.SyntaxKind[nodeAfter.kind]}]:  `,
  );
  console.debug(
    `${indent}${printNode(nodeBefore).replaceAll('\n', `\n${indent}`)}`,
  );
  console.debug(`${indent}↓`);
  console.debug(
    `${indent}${printNode(nodeAfter).replaceAll('\n', `\n${indent}`)}`,
  );
  if (additionalMsg !== undefined) {
    console.debug(`${indent}${additionalMsg}`);
  }
  console.debug();

  return nodeAfter;
};
