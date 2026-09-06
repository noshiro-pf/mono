const pair: readonly [number, number] = [1, 2];

const point = { x: 1, y: 2 };

// Every binding a `let` introduces needs the prefix; each offender is reported.
// @sumi-expect mutation/no-let-without-mut-prefix
let [first, mut_second] = pair;

// @sumi-expect mutation/no-let-without-mut-prefix
let { x: mut_x, y } = point;

first += 1;
mut_second += 1;
mut_x += 1;
y += 1;

export const sum = first + mut_second + mut_x + y;
