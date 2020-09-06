export const mapNullable = <A, B>(fn: (v: A) => B) => (
  value: A | undefined | null
): B | undefined => (value == null ? undefined : fn(value));
