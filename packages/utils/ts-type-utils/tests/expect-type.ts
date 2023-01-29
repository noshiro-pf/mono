// https://github.com/microsoft/TypeScript/issues/27024
// prettier-ignore
type _TypeEq<A, B> =
  (<T>() => T extends A ? 1 : 2) extends
  (<T>() => T extends B ? 1 : 2)
    ? true
    : false;

type _TypeExtends<A, B> = A extends B ? true : false;

/**
 * @param _relation `"=" | "<=" | "!="`
 * @description
 * - `expectType<A, B>("=")` passes if `A` is equal to `B`.
 * - `expectType<A, B>("<=")` passes if `A` extends `B`.
 * - `expectType<A, B>("!=")` passes if `A` is not equal to `B`.
 */
export const expectType = <A, B>(
  _relation: _TypeEq<A, B> extends true
    ? '<=' | '='
    : _TypeExtends<A, B> extends true
    ? '!=' | '<='
    : '!<=' | '!='
): void => undefined;
