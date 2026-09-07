export const identity = <T,>(value: T): T => value;

export const pair = <A, B>(a: A, b: B): readonly [A, B] => [a, b];

export const constrained = <N extends number>(value: N): N => value;

export const withDefault = <T = number,>(value: T): T => value;
