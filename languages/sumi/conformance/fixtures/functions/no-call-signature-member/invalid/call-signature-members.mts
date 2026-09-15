// A call or construct signature written as a member of a type. A lone one is
// a function type spelled the long way; two or more are an overload set, and
// wrapping the literal in a mapped type such as `Readonly<>` silently drops
// every one of them (spec/functions.md, D-58).
export type Parse = {
  // @sumi-expect-error functions/no-call-signature-member
  (value: string): number;
};

export type Show = {
  // @sumi-expect-error functions/no-call-signature-member
  (value: string): string;
  // @sumi-expect-error functions/no-call-signature-member
  (value: number): number;
};

export type Labelled = {
  // @sumi-expect-error functions/no-call-signature-member
  (value: number): string;
  readonly label: string;
};

export type Make = {
  // @sumi-expect-error functions/no-call-signature-member
  new (value: string): Date;
};
