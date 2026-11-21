/* cSpell:disable */
import type { Linter } from 'eslint';

/**
 * @description Disallow converting an `aria-*` value to a string, which synstate-dom does itself.
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  ```
 *
 * @internal Reached by indexing the rules record by the rule's name.
 */
namespace NoAriaStringConversion {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Require `{ equals: () => false }` on `map(() => c)`, since `map` stops every result after the first as equal to the one it holds.
 *
 *  ```md
 *  | key        | value   |
 *  | :--------- | :------ |
 *  | type       | problem |
 *  | deprecated | false   |
 *  | fixable    | code    |
 *  ```
 *
 * @internal Reached by indexing the rules record by the rule's name.
 */
namespace NoConstantMap {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Require `skipIfNoChange()` instead of `map((x) => x)`, which changes no value and only stops a repeated one.
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  | fixable    | code       |
 *  ```
 *
 * @internal Reached by indexing the rules record by the rule's name.
 */
namespace NoIdentityMap {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow deriving or subscribing to a synstate observable in an event handler or after an `await` in a component, where it belongs to no owner and is never disposed or unsubscribed.
 *
 *  ```md
 *  | key        | value   |
 *  | :--------- | :------ |
 *  | type       | problem |
 *  | deprecated | false   |
 *  ```
 *
 * @internal Reached by indexing the rules record by the rule's name.
 */
namespace NoObservableInHandler {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow `skipIfNoChange()` directly after `map` or another `skipIfNoChange()`, which already stop a value equal to the one before.
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  | fixable    | code       |
 *  ```
 *
 * @internal Reached by indexing the rules record by the rule's name.
 */
namespace NoRedundantSkipIfNoChange {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow `throw` in a function passed to a synstate operator, which stops the update midway; return a `Result` instead.
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  ```
 *
 * @internal Reached by indexing the rules record by the rule's name.
 */
namespace NoThrowInOperator {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow calling `.pipe` directly on a synstate `counter(...)` that has no `times` option, since nothing but its owner can stop that counter.
 *
 *  ```md
 *  | key        | value   |
 *  | :--------- | :------ |
 *  | type       | problem |
 *  | deprecated | false   |
 *  ```
 *
 * @internal Reached by indexing the rules record by the rule's name.
 */
namespace NoUnboundedCounterPipe {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow `onFocus` / `onBlur`, which do not bubble in synstate-dom, on an element that cannot take the focus itself.
 *
 *  ```md
 *  | key            | value   |
 *  | :------------- | :------ |
 *  | type           | problem |
 *  | deprecated     | false   |
 *  | hasSuggestions | true    |
 *  ```
 *
 * @internal Reached by indexing the rules record by the rule's name.
 */
namespace NoUnfocusableFocusHandler {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow writing to a synstate state or source from a subscriber or a projection, while the update that called it is propagating.
 *
 *  ```md
 *  | key        | value   |
 *  | :--------- | :------ |
 *  | type       | problem |
 *  | deprecated | false   |
 *  ```
 *
 * @internal Reached by indexing the rules record by the rule's name.
 */
namespace NoWriteDuringPropagation {
  export type RuleEntry = Linter.StringSeverity;
}

export type EslintSynstateRules = Readonly<{
  'synstate/no-aria-string-conversion': NoAriaStringConversion.RuleEntry;
  'synstate/no-constant-map': NoConstantMap.RuleEntry;
  'synstate/no-identity-map': NoIdentityMap.RuleEntry;
  'synstate/no-observable-in-handler': NoObservableInHandler.RuleEntry;
  'synstate/no-redundant-skip-if-no-change': NoRedundantSkipIfNoChange.RuleEntry;
  'synstate/no-throw-in-operator': NoThrowInOperator.RuleEntry;
  'synstate/no-unbounded-counter-pipe': NoUnboundedCounterPipe.RuleEntry;
  'synstate/no-unfocusable-focus-handler': NoUnfocusableFocusHandler.RuleEntry;
  'synstate/no-write-during-propagation': NoWriteDuringPropagation.RuleEntry;
}>;
