/**
 * Compile-time type assertion utility for TypeScript type testing.
 *
 * This function performs static type relationship checking at compile-time and
 * has no runtime effect. It is primarily used in test files to verify that
 * TypeScript's type inference and type relationships work as expected. The
 * function will cause TypeScript compilation errors if the specified type
 * relationship does not hold.
 *
 * ## Supported Type Relations
 *
 * ### Equality Relations
 *
 * - **`"="` (strict equality)**: Asserts that types `A` and `B` are exactly the
 *   same type. Uses TypeScript's internal type equality checking.
 * - **`"!="` (strict inequality)**: Asserts that types `A` and `B` are not
 *   exactly the same type.
 *
 * ### Assignability Relations
 *
 * - **`"~="` (mutual assignability)**: Asserts that `A` extends `B` AND `B`
 *   extends `A`. Types are structurally equivalent and mutually assignable.
 * - **`"<="` (subtype relation)**: Asserts that type `A` extends (is assignable
 *   to) type `B`. Type `A` is a subtype of `B`.
 * - **`">="` (supertype relation)**: Asserts that type `B` extends (is assignable
 *   to) type `A`. Type `A` is a supertype of `B`.
 *
 * ### Negative Assignability Relations
 *
 * - **`"!<="` (not subtype)**: Asserts that type `A` does NOT extend type `B`.
 * - **`"!>="` (not supertype)**: Asserts that type `B` does NOT extend type `A`.
 *
 * ## Type Parameter Constraints
 *
 * @since 1.0.0
 * @template A - The first type for comparison. Can be any TypeScript type
 *   including:
 *
 *   - Primitive types (string, number, boolean, etc.)
 *   - Object types and interfaces
 *   - Union and intersection types
 *   - Generic types and type parameters
 *   - Literal types and branded types
 *   - Function types and return types
 *
 * @template B - The second type for comparison. Same constraints as type `A`.
 * @param _relation - A string literal representing the expected type
 *   relationship. TypeScript's type system automatically infers and restricts
 *   the available operators based on the actual relationship between types `A`
 *   and `B`. If an invalid relationship is specified, TypeScript will show a
 *   compilation error.
 *
 *   Combine `expectType` with runtime assertions for comprehensive testing:
 *
 *   ## Important Notes
 *
 *   - **Compile-time only**: This function has no runtime behavior and will be
 *       optimized away.
 *   - **Type inference**: The available relation operators are automatically
 *       inferred by TypeScript based on the actual type relationship between
 *       `A` and `B`.
 *   - **Error feedback**: Invalid type relationships will cause clear TypeScript
 *       compilation errors.
 *   - **Test organization**: Typically used in `.test.mts` files alongside runtime
 *       assertions.
 *   - **Performance**: Has zero runtime overhead as it's purely a compile-time
 *       construct.
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
