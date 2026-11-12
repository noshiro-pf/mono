// The assertions of `lib-check-entry.branded.ts` that hold only from
// TypeScript 5.8 on. The `tsconfig.lib-files-check.branded.json` of the
// harnesses from v5.8 name this file beside that one; v5.0–v5.7 do not.

import type { Float16, NaNType, SafeUint, TypeEq } from 'ts-type-forge';

/**
 * #4012 — TypeScript 6.0 renamed `lib.esnext.float16.d.ts` to
 * `lib.es2025.float16.d.ts`, and the converter, registered under the old name,
 * stopped running: `Float16Array`'s values and offsets went back to `number`.
 */
declare const plainNumber: number;

declare const dataView: DataView;

export const float16Types = [
  true satisfies TypeEq<ReturnType<typeof Math.f16round>, Float16 | NaNType>,
  true satisfies TypeEq<ReturnType<typeof dataView.getFloat16>, Float16>,
] as const;

// @ts-expect-error A plain `number` is no byte offset.
export const float16AtPlainOffset = dataView.getFloat16(plainNumber);

/**
 * #4014 — `Float16Array`'s size and offset parameters take
 * `TypedArraySizeArgNonNegative`, as the other typed arrays' do in
 * `lib-check-entry.branded.ts`: an integer literal from 0 to 39 or any
 * `SafeUint` is accepted, a larger or negative literal is not.
 */
export const float16ArraySizeArgs = (
  buffer: ArrayBuffer,
  size: SafeUint,
): readonly unknown[] => [
  new Float16Array(4),
  new Float16Array(size),
  new Float16Array(buffer, 0, 2),
  // @ts-expect-error a literal past 39 needs `asSafeUint`
  new Float16Array(40),
  // @ts-expect-error a negative length throws a RangeError
  new Float16Array(-1),
  // @ts-expect-error a negative offset throws a RangeError
  new Float16Array(buffer, -1),
];
