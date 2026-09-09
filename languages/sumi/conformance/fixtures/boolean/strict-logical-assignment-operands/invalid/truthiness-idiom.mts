export const idiom = (name: string | undefined, fallback: string): string => {
  let mut_name = name;

  // The `opts ||= {}` idiom: this is truthiness, not a boolean fold (D-29).
  // @sumi-expect-error boolean/strict-logical-assignment-operands
  mut_name ||= fallback;

  return mut_name ?? fallback;
};
