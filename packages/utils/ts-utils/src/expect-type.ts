/**
 * @param _relation `"=" | "<=" | "!="`
 * @description
 * - `expectType<A, B>("=")` passes if `A` is equal to `B`.
 * - `expectType<A, B>("<=")` passes if `A` extends `B`.
 * - `expectType<A, B>("!=")` passes if `A` is not equal to `B`.
 */
export const expectType = <A, B>(
  _relation: TypeEq<A, B> extends true
    ? '<=' | '='
    : TypeExtends<A, B> extends true
    ? '!=' | '<='
    : '!<=' | '!='
): void => undefined;
