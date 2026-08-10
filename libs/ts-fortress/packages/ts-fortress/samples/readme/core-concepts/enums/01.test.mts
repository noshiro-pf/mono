import * as t from 'ts-fortress';

// String enums
const ColorEnum = t.enumType(['red', 'green', 'blue']);

type Color = t.TypeOf<typeof ColorEnum>; // 'red' | 'green' | 'blue'

// Numeric ranges (end is exclusive)
const DiceRoll = t.uintRange(1, 7, { defaultValue: 1 }); // integers from 1 to 6

type DiceRoll = t.TypeOf<typeof DiceRoll>; // 1 | 2 | 3 | 4 | 5 | 6

// Numeric ranges (end is inclusive)
const DiceRoll2 = t.uintRangeInclusive(1, 6, { defaultValue: 1 }); // integers from 1 to 6

type DiceRoll2 = t.TypeOf<typeof DiceRoll2>; // 1 | 2 | 3 | 4 | 5 | 6

// embed-sample-code-ignore-below
export { ColorEnum, DiceRoll, DiceRoll2, type Color };
