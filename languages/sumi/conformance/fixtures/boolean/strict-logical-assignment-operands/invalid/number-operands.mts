export const clamp = (count: number, floor: number): number => {
  let mut_count = count;

  // @sumi-expect-error boolean/strict-logical-assignment-operands
  mut_count &&= floor;

  return mut_count;
};
