// A function expression checked against more than one call signature. When
// the checker accepts it, its own signature already accepts every call the
// set does and returns no less precisely, so the set says nothing a single
// signature does not; when the return type varies, it cannot be written at all
// without an assertion (D-58).
type Describe = ((value: string) => string) &
  ((value: readonly string[]) => string);

export const describe: Describe =
  // @sumi-expect-error functions/no-overloaded-function-expression
  (value: string | readonly string[]): string =>
    typeof value === 'string' ? value : value.join(', ');

type Codec = Readonly<{
  encode: ((value: string) => string) & ((value: number) => string);
}>;

export const codec: Codec = {
  // @sumi-expect-error functions/no-overloaded-function-expression
  encode: (value: number | string): string => `${value}`,
};
