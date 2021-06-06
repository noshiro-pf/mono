export type ToObjectKeysValue<A> = A extends string
  ? A
  : A extends number
  ? `${A}`
  : never;
