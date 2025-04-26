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
  elementTypes: readonly ts.TypeNode[],
  context: ts.TransformationContext,
): ts.TypeOperatorNode =>
  createReadonlyTypeOperatorNode(
    context.factory.createTupleTypeNode(elementTypes),
    context,
  );

export const createReadonlyArrayTypeNode = (
  elementType: ts.TypeNode,
  context: ts.TransformationContext,
): ts.TypeOperatorNode =>
  createReadonlyTypeOperatorNode(
    context.factory.createArrayTypeNode(elementType),
    context,
  );

export const createReadonlyTypeNode = (
  t: ts.TypeNode,
  context: ts.TransformationContext,
): ts.TypeReferenceNode =>
  context.factory.createTypeReferenceNode(
    context.factory.createIdentifier('Readonly'),
    [t],
  );
