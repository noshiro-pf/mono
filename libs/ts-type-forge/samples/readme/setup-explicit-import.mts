// src/types/dice.ts
import { type UintRange } from 'ts-type-forge';

export type DiceValue = UintRange<1, 7>; // 1 | 2 | 3 | 4 | 5 | 6
