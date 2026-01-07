export type A = {
  name?: string;
  point: [x: number, y: number, z?: number];
  meta: {
    description?: string;
    tags: string[];
  };
};
