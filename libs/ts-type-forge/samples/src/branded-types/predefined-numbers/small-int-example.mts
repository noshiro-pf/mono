import { type SmallInt } from 'ts-type-forge';

// embed-sample-code-ignore-above

type DiceValue = SmallInt<'>0', 7>; // 1 | 2 | 3 | 4 | 5 | 6
type Temperature = SmallInt<'', 101>; // -100 to 100
type Countdown = SmallInt<'>=0', 11>; // 0 | 1 | 2 | ... | 10
type Offset = SmallInt<'!=0', 6>; // -5 | -4 | -3 | -2 | -1 | 1 | 2 | 3 | 4 | 5

// embed-sample-code-ignore-below
export type { Countdown, DiceValue, Offset, Temperature };
