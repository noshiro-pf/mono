const mut_grow: [number, number] = [1, 2];

// @sumi-expect-error mutation/no-tuple-length-change
mut_grow.push(3);

// @sumi-expect-error mutation/no-tuple-length-change
mut_grow.splice(0, 1);

export const grow = mut_grow;
