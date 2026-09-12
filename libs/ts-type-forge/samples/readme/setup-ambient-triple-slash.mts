// This sample documents ambient access through a triple-slash directive, but it
// is checked in the package's named-import program, where
// `ts-type-forge/global` is deliberately not loaded: loading it here would
// make every type visible to `src/` without an import and hide a missing one.
// The hidden import below stands in for the directive — which, placed after a
// statement, is an ordinary comment and loads nothing — so what is checked is
// the snippet's use of the type; that the directive really resolves the ambient
// globals is asserted by `test/dist_/ambient/`.
import { type UintRange } from 'ts-type-forge';
// embed-sample-code-ignore-above

// src/globals.d.ts or any other .ts file
/// <reference types="ts-type-forge/global" />

// src/types/dice.ts
// No import needed
export type DiceValue = UintRange<1, 7>; // 1 | 2 | 3 | 4 | 5 | 6
