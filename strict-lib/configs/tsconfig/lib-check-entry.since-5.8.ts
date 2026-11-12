// The assertions of `lib-check-entry.ts` that hold only from TypeScript 5.8 on.
// The `tsconfig.lib-check*.json` of the harnesses from v5.8 name this file
// beside that one; v5.0–v5.7 do not.

import type { TypeEq } from 'ts-type-forge';

/**
 * #4012 — `Float16Array` (TypeScript 5.8's `lib.esnext.float16.d.ts`) moved to
 * `lib.es2025.float16.d.ts` in 6.0, and its converter, registered under the old
 * name, stopped running: the element size went back to `number`, and in the
 * branded flavor every index and size with it.
 */
export const float16ArrayTypes = [
  true satisfies TypeEq<Float16Array['BYTES_PER_ELEMENT'], 2>,
  true satisfies TypeEq<typeof Float16Array.BYTES_PER_ELEMENT, 2>,
] as const;
