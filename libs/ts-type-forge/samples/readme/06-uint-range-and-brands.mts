const IGNORE_EMBEDDING = (..._args: readonly unknown[]): void => {};
type User = { id: UserId };
type Product = { id: ProductId };
// embed-sample-code-ignore-above

/**
 * Parse integer with constrained radix parameter
 * @param str A string to convert into a number
 * @param radix A value between 2 and 36 that specifies the base
 */
export const parseInteger = (str: string, radix?: UintRange<2, 37>): number =>
  Number.parseInt(str, radix);

// Alternative using inclusive range
export const parseIntegerInclusive = (
  str: string,
  radix?: UintRangeInclusive<2, 36>,
): number => Number.parseInt(str, radix);

// Valid usages:
parseInteger('10'); // radix defaults to 10
parseInteger('10', 2); // Binary
parseInteger('255', 16); // Hexadecimal
parseInteger('123', 36); // Maximum base

// Invalid usages (TypeScript will error):
// @ts-expect-error Argument of type '1' is not assignable to parameter of type 'UintRange<2, 37> | undefined'
parseInteger('10', 1);
// @ts-expect-error Argument of type '37' is not assignable to parameter of type 'UintRange<2, 37> | undefined'
parseInteger('10', 37);

// Branded types for additional safety
type UserId = Brand<number, 'UserId'>;
type ProductId = Brand<number, 'ProductId'>;

// Create branded values (you would typically have constructor functions)
declare const userId: UserId;
declare const productId: ProductId;

// Type-safe functions that can't mix up IDs
const getUserById = (id: UserId): User | undefined => {
  /* ... */
  IGNORE_EMBEDDING(id);
  return undefined;
};
const getProductById = (id: ProductId): Product | undefined => {
  /* ... */
  IGNORE_EMBEDDING(id);
  return undefined;
};

// @ts-expect-error Argument of type 'ProductId' is not assignable to parameter of type 'UserId'
getUserById(productId);

// embed-sample-code-ignore-below
export { getProductById, getUserById, productId, userId };
