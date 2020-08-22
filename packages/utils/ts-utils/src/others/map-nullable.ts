export const mapNullable = <A, B>(fn: (v: A) => B) => (
  value: A | undefined
): B | undefined => (value === undefined ? undefined : fn(value));
