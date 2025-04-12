/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */
import * as ts from 'typescript';

export const createReadonlyTypeOperatorNode = (
  tupleOrArray: ts.TupleTypeNode | ts.ArrayTypeNode,
  context: ts.TransformationContext,
): ts.TypeOperatorNode =>
  context.factory.createTypeOperatorNode(
    ts.SyntaxKind.ReadonlyKeyword,
    tupleOrArray,
  );

export const createReadonlyTupleTypeNode = (
  Es: readonly ts.TypeNode[],
  context: ts.TransformationContext,
): ts.TypeOperatorNode =>
  context.factory.createTypeOperatorNode(
    ts.SyntaxKind.ReadonlyKeyword,
    context.factory.createTupleTypeNode(Es),
  );

export const createReadonlyArrayTypeNode = (
  t: ts.TypeNode,
  context: ts.TransformationContext,
): ts.TypeOperatorNode =>
  context.factory.createTypeOperatorNode(
    ts.SyntaxKind.ReadonlyKeyword,
    context.factory.createArrayTypeNode(t),
  );

export const createReadonlyTypeNode = (
  t: ts.TypeNode,
  context: ts.TransformationContext,
): ts.TypeReferenceNode =>
  context.factory.createTypeReferenceNode(
    context.factory.createIdentifier('Readonly'),
    [t],
  );
