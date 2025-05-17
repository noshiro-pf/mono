import { SafeUint, strictMatch } from '@noshiro/ts-utils';

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
  { indexedAccessDepth: SafeUintWithSmallInt } & (
    | { type: 'DeepReadonly' }
    | { type: 'Readonly' }
    | { type: 'readonly' }
    | { type: 'none' }
  )
>;

export const nextReadonlyContext = <
  const Curr extends ReadonlyContext,
  const Next extends ReadonlyContext['type'],
>({
  currentReadonlyContext: curr,
  nextReadonlyContextType: next,
  indexedAccessDepthChange = 'infinity',
}: Readonly<
  {
    currentReadonlyContext: Curr;
  } & (
    | {
        nextReadonlyContextType: Next;
        indexedAccessDepthChange: 'decr' | 'incr' | 'keep' | 'infinity';
      }
    | {
        nextReadonlyContextType: Extract<
          ReadonlyContext['type'],
          'DeepReadonly'
        >;
        indexedAccessDepthChange?: 'infinity';
      }
  )
>): Readonly<{
  type: Extract<ReadonlyContext['type'], 'DeepReadonly'> | Next;
  indexedAccessDepth: SafeUintWithSmallInt;
}> =>
  curr.type === 'DeepReadonly'
    ? {
        type: 'DeepReadonly',
        indexedAccessDepth: SafeUint.MAX_VALUE,
      }
    : {
        type: next,
        indexedAccessDepth: strictMatch(indexedAccessDepthChange, {
          decr: SafeUint.sub(curr.indexedAccessDepth, 1),
          keep: curr.indexedAccessDepth,
          incr: SafeUint.add(curr.indexedAccessDepth, 1),
          infinity: SafeUint.MAX_VALUE,
        }),
      };
