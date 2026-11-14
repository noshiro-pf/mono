/**
 * Controls whether to make a layer mutable during recursive transformation
 * calls, to standardize by omitting readonly from inner `number[]` in types
 * like `DeepReadonly<[string, number[]]>`.
 *
 * - `"DeepReadonly"`: Indicates that `node` is inside a type utility like
 *   `DeepReadonly` that recursively applies readonly.
 * - `"Readonly"`: Indicates that `node` is directly under a `Readonly` type.
 * - `"readonly"`: Indicates that `node` is directly under a `readonly` operator.
 * - `"IndexedAccessObjectType"`: Indicates that `node` is directly under an
 *   IndexedAccessTypeNode.
 * - `"none"`: All other cases
 */
export type ReadonlyContext = Readonly<
  { indexedAccessDepth: number } & (
    | { type: 'DeepReadonly' }
    | { type: 'Readonly' }
    | { type: 'readonly' }
    | { type: 'none' }
  )
>;

export const nextReadonlyContext = <const C extends ReadonlyContext>(
  currentReadonlyContext: ReadonlyContext,
  readonlyContext: C,
): Readonly<{ type: 'DeepReadonly'; indexedAccessDepth: number }> | C =>
  currentReadonlyContext.type === 'DeepReadonly'
    ? currentReadonlyContext
    : readonlyContext;

export const decrementIndexedAccessDepth = (
  readonlyContext: ReadonlyContext,
): ReadonlyContext['indexedAccessDepth'] =>
  Math.max(0, readonlyContext.indexedAccessDepth - 1);

export const incrementIndexedAccessDepth = (
  readonlyContext: ReadonlyContext,
): ReadonlyContext['indexedAccessDepth'] =>
  readonlyContext.indexedAccessDepth + 1;
