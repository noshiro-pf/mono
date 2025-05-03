export {
  appendAsConstTransformer,
  compareUnionIntersectionTypes,
  convertToReadonlyTypeTransformer,
  groupUnionIntersectionTypes,
  invalidDeepReadonlyTypeName,
  replaceAnyWithUnknownTransformer,
} from './ast-transformers/index.mjs';
export type {
  ReadonlyContext,
  ReadonlyTransformerOptions,
} from './ast-transformers/index.mjs';
export {
  astTransformerToStringTransformer,
  createReadonlyArrayTypeNode,
  createReadonlyTupleTypeNode,
  createReadonlyTypeNode,
  createReadonlyTypeOperatorNode,
  isPrimitiveTypeNode,
  isReadonlyArrayTypeNode,
  isReadonlyTupleOrArrayTypeNode,
  isReadonlyTupleTypeNode,
  isReadonlyTypeNode,
  isSpreadNamedTupleMemberNode,
  isSpreadParameterNode,
} from './functions/index.mjs';
export type {
  PrimitiveTypeNode,
  ReadonlyArrayTypeNode,
  ReadonlyTupleTypeNode,
  ReadonlyTypeNode,
} from './functions/index.mjs';
export {
  codeFromStringLines,
  createTransformerFactory,
  decodeEmptyLines,
  encodeEmptyLines,
  printNode,
} from './utils/index.mjs';
