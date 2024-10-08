export type Point = Readonly<{
  x: number;
  y: number;
}>;

export const defaultPoint = { x: 0, y: 0 } as const satisfies Point;
