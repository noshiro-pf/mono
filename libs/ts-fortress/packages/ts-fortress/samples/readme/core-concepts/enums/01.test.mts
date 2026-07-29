import * as t from 'ts-fortress';

// String enums
const ColorEnum = t.enumType(['red', 'green', 'blue']);

type Color = t.TypeOf<typeof ColorEnum>; // 'red' | 'green' | 'blue'

// Numeric ranges
const DiceRoll = t.uintRange({
  start: 1,
  end: 7,
  defaultValue: 1,
}); // integers from 1 to 6

type DiceRoll = t.TypeOf<typeof DiceRoll>; // 1 | 2 | 3 | 4 | 5 | 6

// embed-sample-code-ignore-below
export { ColorEnum, DiceRoll, type Color };
