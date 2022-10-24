export const mapOptional = <A, B>(
  value: A | null | undefined,
  fn: (v: A) => B
): B | undefined => (value == null ? undefined : fn(value));

export const mapOptionalC =
  <A, B>(fn: (v: A) => B) =>
  (value: A | null | undefined): B | undefined =>
    value == null ? undefined : fn(value);
