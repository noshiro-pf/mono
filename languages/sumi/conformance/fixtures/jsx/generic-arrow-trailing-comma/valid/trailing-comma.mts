export const identity = <T,>(value: T): T => value;

export const pair = <A, B>(a: A, b: B): readonly [A, B] => [a, b];
