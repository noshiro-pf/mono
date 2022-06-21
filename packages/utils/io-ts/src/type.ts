export type Type<A> = Readonly<{
  defaultValue: A;
  is: (value: unknown) => value is A;
  fill: (value: unknown) => A;
}>;

export type Typeof<A extends Type<unknown>> = ReturnType<A['fill']>;
