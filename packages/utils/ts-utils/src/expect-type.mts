/**
 * - `expectType<A, B>("=")` passes if `A` is equal to `B`.
 * - `expectType<A, B>("~=")` passes if `A` extends `B` and `B` extends `A`.
 * - `expectType<A, B>("<=")` passes if `A` extends `B`.
 * - `expectType<A, B>(">=")` passes if `B` extends `A`.
 * - `expectType<A, B>("!<=")` passes if `A` doesn't extend `B`.
 * - `expectType<A, B>("!>=")` passes if `B` doesn't extend `A`.
 * - `expectType<A, B>("!=")` passes if `A` is not equal to `B`.
 *
 * @param _relation `"=" | "~=" | "<=" | ">=" | "!<=" | "!>=" | "!="`
 */
export const expectType = <A, B>(
  _relation: TypeEq<A, B> extends true
    ? '<=' | '=' | '>=' | '~='
    :
        | '!='
        | (TypeExtends<A, B> extends true
            ? '<=' | (TypeExtends<B, A> extends true ? '>=' | '~=' : '!>=')
            : '!<=' | (TypeExtends<B, A> extends true ? '>=' : '!>=')),
): void => undefined;

export const assertType = expectType;
