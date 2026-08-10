export interface A {
  name?: string;
  point: [x: number, y: number, z?: number];
  meta: {
    description?: string;
    tags: string[];
    attributes: Record<string, unknown>;
    data?: any;
  };
}

export const obj = {
  point: [1, 2],
  meta: {
    tags: ['example', 'test'],
    attributes: {
      key1: 'value1',
      key2: 42,
    },
  },
} satisfies A;

export const arr = ['a', {}, 0];
