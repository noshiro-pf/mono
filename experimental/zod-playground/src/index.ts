import * as E from 'fp-ts/Either';
import * as t from 'io-ts';
import * as z from 'zod';

export namespace Zod {
  export const Int = z
    .number()
    .refine(
      (a) => Number.isInteger(a),
      (a) => ({ message: `Invalid value "${a}" supplied to Int` }),
    )
    .brand('Int');

  export type Int = z.infer<typeof Int>;

  export const isInt = (a: number): a is Int => Int.safeParse(a).success;

  export const toInt = (a: number): Int => Int.parse(a);
}

export namespace Iots {
  type IntBrand = { readonly Int: unique symbol };

  export const Int = t.brand(
    t.number,
    (a): a is t.Branded<number, IntBrand> => Number.isInteger(a),
    'Int',
  );

  export type Int = t.TypeOf<typeof Int>;

  export const isInt = (a: number): a is Int => E.isRight(Int.decode(a));

  export const toInt = (a: number): Int => {
    const ret = Int.decode(a);
    if (E.isLeft(ret)) {
      throw new Error(ret.left.toString());
    }
    return ret.right;
  };
}
