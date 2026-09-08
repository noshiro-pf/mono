export type Box = Readonly<{
  // @sumi-expect-error null/no-null-in-type
  value: number | null;
}>;

export const unwrap = (
  // @sumi-expect-error null/no-null-in-type
  box: Readonly<{ value: number | null }>,
): number => box.value ?? 0;
