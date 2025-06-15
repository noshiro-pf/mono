/**
 * Implements the logical implication (if-then) operator.
 *
 * Returns `true` if the antecedent is `false` or the consequent is `true`.
 * In logical terms: `antecedent → consequent` is equivalent to `¬antecedent ∨ consequent`.
 *
 * **Truth table:**
 * - `true → true` = `true` (valid implication)
 * - `true → false` = `false` (invalid implication)
 * - `false → true` = `true` (vacuously true)
 * - `false → false` = `true` (vacuously true)
 *
 * @param antecedent - The condition (if part)
 * @param consequent - The result that should hold if the condition is true (then part)
 * @returns `true` if the implication holds, `false` otherwise
 *
 * @example Basic truth table demonstration
 * ```typescript
 * ifThen(true, true);   // true  (if true then true = true)
 * ifThen(true, false);  // false (if true then false = false)
 * ifThen(false, true);  // true  (if false then true = true - vacuously true)
 * ifThen(false, false); // true  (if false then false = true - vacuously true)
 * ```
 *
 * @example Validation logic - "if required then must have value"
 * ```typescript
 * function validateField(value: string, isRequired: boolean): boolean {
 *   const hasValue = value.trim().length > 0;
 *   return ifThen(isRequired, hasValue);
 * }
 *
 * validateField('hello', true);  // true (required and has value)
 * validateField('', true);       // false (required but no value)
 * validateField('', false);      // true (not required, so valid)
 * validateField('hello', false); // true (not required, but has value is fine)
 * ```
 *
 * @example Access control - "if admin then has all permissions"
 * ```typescript
 * function checkPermission(user: User, permission: string): boolean {
 *   const isAdmin = user.role === 'admin';
 *   const hasPermission = user.permissions.includes(permission);
 *
 *   // Admin must have all permissions
 *   return ifThen(isAdmin, hasPermission);
 * }
 *
 * const adminUser = { role: 'admin', permissions: ['read', 'write'] };
 * checkPermission(adminUser, 'delete'); // false (admin without delete permission = invalid)
 *
 * const regularUser = { role: 'user', permissions: ['read'] };
 * checkPermission(regularUser, 'delete'); // true (non-admin without permission is valid)
 * ```
 *
 * @example Contract validation - "if premium then features enabled"
 * ```typescript
 * interface Subscription {
 *   isPremium: boolean;
 *   features: {
 *     advancedAnalytics: boolean;
 *     unlimitedStorage: boolean;
 *     prioritySupport: boolean;
 *   };
 * }
 *
 * function validateSubscription(sub: Subscription): boolean {
 *   // If premium, then all premium features must be enabled
 *   return ifThen(sub.isPremium,
 *     sub.features.advancedAnalytics &&
 *     sub.features.unlimitedStorage &&
 *     sub.features.prioritySupport
 *   );
 * }
 * ```
 *
 * @example Chaining multiple implications
 * ```typescript
 * // "If A then B" AND "If B then C"
 * function validateChain(a: boolean, b: boolean, c: boolean): boolean {
 *   return ifThen(a, b) && ifThen(b, c);
 * }
 *
 * validateChain(true, true, true);   // true (valid chain)
 * validateChain(true, false, true);  // false (breaks at first implication)
 * validateChain(false, false, false); // true (vacuously true chain)
 * ```
 *
 * @example Negation patterns
 * ```typescript
 * // "If not expired then valid" is equivalent to "expired OR valid"
 * const isExpired = Date.now() > expiryDate;
 * const isValid = checkValidity();
 * const result = ifThen(!isExpired, isValid);
 * // Same as: isExpired || isValid
 * ```
 */
export const ifThen = (antecedent: boolean, consequent: boolean): boolean =>
  !antecedent || consequent;
