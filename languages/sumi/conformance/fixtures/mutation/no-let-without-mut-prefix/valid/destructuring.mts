const pair: readonly [number, number] = [1, 2];

const point = { x: 1, y: 2 };

let [mut_first, mut_second] = pair;

let { x: mut_x, y: mut_y } = point;

mut_first += 1;
mut_second += 1;
mut_x += 1;
mut_y += 1;

export const sum = mut_first + mut_second + mut_x + mut_y;
