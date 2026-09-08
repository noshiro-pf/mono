const input: unknown = 'text';

// @sumi-expect-error banned-syntax/no-unsafe-type-assertion
export const text = input as string;
