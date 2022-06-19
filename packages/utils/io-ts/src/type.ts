export type Type<A, D extends A = A> = Readonly<{
  defaultValue: D;
  is: (value: unknown) => value is A;
  fill: (value: unknown) => A;
}>;

export type Typeof<A extends Type<unknown>> = ReturnType<A['fill']>;
