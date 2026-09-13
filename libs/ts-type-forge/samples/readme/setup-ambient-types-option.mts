// This sample documents ambient access through `compilerOptions.types`, but it
// is checked in the package's named-import program, where
// `ts-type-forge/global` is deliberately not loaded: loading it here would
// make every type visible to `src/` without an import and hide a missing one.
// The hidden import below stands in for the tsconfig entry, so what is checked
// is the snippet's use of the type; that the ambient globals really resolve
// is asserted by `test/dist_/ambient-types-option/`.
import { type UintRange } from 'ts-type-forge';
// embed-sample-code-ignore-above

// src/types/dice.ts
// No import needed
export type DiceValue = UintRange<1, 7>; // 1 | 2 | 3 | 4 | 5 | 6
