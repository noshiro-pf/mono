/**
 * Implements the logical implication (if-then) operator.
 *
 * Returns `true` if the antecedent is `false` or the consequent is `true`. In
 * logical terms: `antecedent → consequent` is equivalent to `¬antecedent ∨
 * consequent`.
 *
 * **Truth table:**
 *
 * - `true → true` = `true` (valid implication)
 * - `true → false` = `false` (invalid implication)
 * - `false → true` = `true` (vacuously true)
 * - `false → false` = `true` (vacuously true)
 *
 * @param antecedent - The condition (if part)
 * @param consequent - The result that should hold if the condition is true
 *   (then part)
 * @returns `true` if the implication holds, `false` otherwise
 */
export const ifThen = (antecedent: boolean, consequent: boolean): boolean =>
  !antecedent || consequent;
