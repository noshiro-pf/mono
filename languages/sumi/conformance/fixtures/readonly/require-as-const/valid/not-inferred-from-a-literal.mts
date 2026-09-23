// A primitive has nothing to mutate, and a literal that is an argument or a
// return value is typed by the parameter or the return annotation.
export const count = 3;

export const label = `n=${count}`;

const toPair = (value: number): readonly [number, number] => [value, value];

export const pair = toPair(count);

export const sorted = [3, 1, 2].toSorted((a, b) => a - b);
