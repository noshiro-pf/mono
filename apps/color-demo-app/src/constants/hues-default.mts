import { Arr, asUint16 } from 'ts-data-forge';
import { type NonEmptyArray } from 'ts-type-forge';

const seq = Arr.seq(asUint16(360));

// `NonEmptyArray` carries a brand, so only a guard can establish it — a literal
// or an assertion cannot. `Arr.seq` returns `NonEmptyArray` directly only when
// its argument is statically positive, and `Uint16` includes 0. This check
// cannot fail.
if (!Arr.isNonEmpty(seq)) {
  throw new Error('huesDefault: Arr.seq(360) returned an empty array');
}

/**
 * 0–359, the hue axis every distribution in this app is computed over.
 *
 * Typed `NonEmptyArray<number>` rather than `Seq<360>`. The exact 360-element
 * tuple type buys nothing at runtime, and it costs a great deal at check time:
 * once it flows through `Arr.map` / `Arr.scan` / `Arr.zip`, whose `const` type
 * parameters preserve tuple shape, `tsc` gives up with TS2589/TS2590.
 * Non-emptiness is the only part of the shape the code relies on.
 */
export const huesDefault: NonEmptyArray<number> = seq;
