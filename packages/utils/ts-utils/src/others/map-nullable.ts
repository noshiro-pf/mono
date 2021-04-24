export const mapNullable = <A, B>(fn: (v: A) => B) => (
  value: A | null | undefined
): B | undefined => (value == null ? undefined : fn(value));
