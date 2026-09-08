let mut_count = 0;

// @sumi-expect-error banned-syntax/no-increment-decrement
mut_count++;

export const result = mut_count;
