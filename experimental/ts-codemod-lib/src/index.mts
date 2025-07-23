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
  transformSourceCode,
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
