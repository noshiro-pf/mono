/* cSpell:disable */
import { type Linter } from 'eslint';

/**
 * Enforces the use of TypeScript's strict mode.
 *
 * @link https://github.com/danielnixon/eslint-plugin-total-functions
 *
 *  ```md
 *  | key        | value   |
 *  | :--------- | :------ |
 *  | type       | problem |
 *  | deprecated | false   |
 *  ```
 */
namespace RequireStrictMode {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Bans unsafe type assertions.
 *
 * @link https://github.com/danielnixon/eslint-plugin-total-functions
 *
 *  ```md
 *  | key        | value   |
 *  | :--------- | :------ |
 *  | type       | problem |
 *  | deprecated | false   |
 *  ```
 */
namespace NoUnsafeTypeAssertion {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Bans unsafe assignment from readonly to mutable types.
 *
 * @link https://github.com/danielnixon/eslint-plugin-total-functions
 *
 *  ```md
 *  | key        | value   |
 *  | :--------- | :------ |
 *  | type       | problem |
 *  | deprecated | false   |
 *  ```
 */
namespace NoUnsafeReadonlyMutableAssignment {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Bans unsafe assignment from mutable to readonly types.
 *
 * @link https://github.com/danielnixon/eslint-plugin-total-functions
 *
 *  ```md
 *  | key        | value   |
 *  | :--------- | :------ |
 *  | type       | problem |
 *  | deprecated | false   |
 *  ```
 */
namespace NoUnsafeMutableReadonlyAssignment {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Bans enums.
 *
 * @link https://github.com/danielnixon/eslint-plugin-total-functions
 *
 *  ```md
 *  | key        | value   |
 *  | :--------- | :------ |
 *  | type       | problem |
 *  | deprecated | false   |
 *  ```
 */
namespace NoEnums {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Bans the partial URL construction.
 *
 * @link https://github.com/danielnixon/eslint-plugin-total-functions
 *
 *  ```md
 *  | key        | value   |
 *  | :--------- | :------ |
 *  | type       | problem |
 *  | deprecated | false   |
 *  ```
 */
namespace NoPartialUrlConstructor {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Bans partial division.
 *
 * @link https://github.com/danielnixon/eslint-plugin-total-functions
 *
 *  ```md
 *  | key        | value   |
 *  | :--------- | :------ |
 *  | type       | problem |
 *  | deprecated | false   |
 *  ```
 */
namespace NoPartialDivision {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Bans partial String.prototype.normalize()
 *
 * @link https://github.com/danielnixon/eslint-plugin-total-functions
 *
 *  ```md
 *  | key        | value   |
 *  | :--------- | :------ |
 *  | type       | problem |
 *  | deprecated | false   |
 *  ```
 */
namespace NoPartialStringNormalize {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Bans interpretation (execution) of fp-ts effects.
 *
 * @link https://github.com/danielnixon/eslint-plugin-total-functions
 *
 *  ```md
 *  | key        | value   |
 *  | :--------- | :------ |
 *  | type       | problem |
 *  | deprecated | false   |
 *  ```
 */
namespace NoPrematureFpTsEffects {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Bans problematic nested fp-ts effects.
 *
 * @link https://github.com/danielnixon/eslint-plugin-total-functions
 *
 *  ```md
 *  | key        | value   |
 *  | :--------- | :------ |
 *  | type       | problem |
 *  | deprecated | false   |
 *  ```
 */
namespace NoNestedFpTsEffects {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Bans partial Array.prototype.reduce()
 *
 * @link https://github.com/danielnixon/eslint-plugin-total-functions
 *
 *  ```md
 *  | key        | value   |
 *  | :--------- | :------ |
 *  | type       | problem |
 *  | deprecated | false   |
 *  ```
 */
namespace NoPartialArrayReduce {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Bans hidden type assertions.
 *
 * @link https://github.com/danielnixon/eslint-plugin-total-functions
 *
 *  ```md
 *  | key        | value   |
 *  | :--------- | :------ |
 *  | type       | problem |
 *  | deprecated | false   |
 *  ```
 */
namespace NoHiddenTypeAssertions {
  export type RuleEntry = Linter.StringSeverity;
}

export type EslintTotalFunctionsRules = {
  readonly 'total-functions/require-strict-mode': RequireStrictMode.RuleEntry;
  readonly 'total-functions/no-unsafe-type-assertion': NoUnsafeTypeAssertion.RuleEntry;
  readonly 'total-functions/no-unsafe-readonly-mutable-assignment': NoUnsafeReadonlyMutableAssignment.RuleEntry;
  readonly 'total-functions/no-unsafe-mutable-readonly-assignment': NoUnsafeMutableReadonlyAssignment.RuleEntry;
  readonly 'total-functions/no-enums': NoEnums.RuleEntry;
  readonly 'total-functions/no-partial-url-constructor': NoPartialUrlConstructor.RuleEntry;
  readonly 'total-functions/no-partial-division': NoPartialDivision.RuleEntry;
  readonly 'total-functions/no-partial-string-normalize': NoPartialStringNormalize.RuleEntry;
  readonly 'total-functions/no-premature-fp-ts-effects': NoPrematureFpTsEffects.RuleEntry;
  readonly 'total-functions/no-nested-fp-ts-effects': NoNestedFpTsEffects.RuleEntry;
  readonly 'total-functions/no-partial-array-reduce': NoPartialArrayReduce.RuleEntry;
  readonly 'total-functions/no-hidden-type-assertions': NoHiddenTypeAssertions.RuleEntry;
};
