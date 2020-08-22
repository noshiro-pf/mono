export type RectSize = Readonly<{
  height: number;
  width: number;
}>;

export const defaultRectSize: RectSize = {
  height: 0,
  width: 0,
} as const;
