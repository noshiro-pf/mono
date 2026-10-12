// `as const`, a `mut_` name, or an annotation each settle the binding's type.
export const point = { x: 1, y: 2 } as const;

export const origin = { x: 0, y: 0 } as const satisfies Readonly<{
  x: number;
  y: number;
}>;

const mut_scratch: number[] = [];

const mut_buffer = [0, 0];

mut_scratch.push(1);
mut_buffer.push(1);

export const annotated: readonly string[] = ['a', 'b'];

// Another assertion states the type itself.
export const asserted = [] as readonly number[];

export const buffers = [mut_scratch, mut_buffer] as const;
