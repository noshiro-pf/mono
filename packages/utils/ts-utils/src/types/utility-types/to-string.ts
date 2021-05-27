export type ToString<A> = A extends number ? `${A}` : A;
