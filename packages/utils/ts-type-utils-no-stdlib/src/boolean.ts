export type BoolNot<A extends boolean> = A extends true ? false : true;

export type BoolAnd<A extends boolean, B extends boolean> = A extends true
  ? B extends true
    ? true
    : false
  : false;

export type BoolOr<A extends boolean, B extends boolean> = A extends false
  ? B extends false
    ? false
    : true
  : true;

export type BoolNand<A extends boolean, B extends boolean> = BoolNot<
  BoolAnd<A, B>
>;

export type BoolNor<A extends boolean, B extends boolean> = BoolNot<
  BoolOr<A, B>
>;

export type BoolEq<A extends boolean, B extends boolean> = BoolOr<
  BoolAnd<A, B>,
  BoolAnd<BoolNot<A>, BoolNot<B>>
>;

export type BoolNeq<A extends boolean, B extends boolean> = BoolNot<
  BoolEq<A, B>
>;
