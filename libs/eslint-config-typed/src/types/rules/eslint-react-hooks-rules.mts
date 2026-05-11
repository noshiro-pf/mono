/* cSpell:disable */
import { type Linter } from 'eslint';
import { type UnknownRecord } from 'ts-type-forge';

type SpreadOptionsIfIsArray<
  T extends readonly [Linter.StringSeverity, unknown],
> = T[1] extends readonly unknown[]
  ? readonly [Linter.StringSeverity, ...T[1]]
  : T;

/**
 * @description verifies the list of dependencies for Hooks like useEffect and similar
 * @link https://github.com/facebook/react/issues/14920
 *
 *  ```md
 *  | key            | value      |
 *  | :------------- | :--------- |
 *  | type           | suggestion |
 *  | deprecated     | false      |
 *  | fixable        | code       |
 *  | hasSuggestions | true       |
 *  | recommended    | true       |
 *  ```
 */
namespace ExhaustiveDeps {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "enableDangerousAutofixThisMayCauseInfiniteLoops": false,
   *     "properties": {
   *       "additionalHooks": {
   *         "type": "string"
   *       },
   *       "enableDangerousAutofixThisMayCauseInfiniteLoops": {
   *         "type": "boolean"
   *       },
   *       "experimental_autoDependenciesHooks": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         }
   *       },
   *       "requireExplicitEffectDeps": {
   *         "type": "boolean"
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    additionalHooks?: string;
    enableDangerousAutofixThisMayCauseInfiniteLoops?: boolean;
    experimental_autoDependenciesHooks?: readonly string[];
    requireExplicitEffectDeps?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description enforces the Rules of Hooks
 * @link https://react.dev/reference/rules/rules-of-hooks
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | false   |
 *  | recommended | true    |
 *  ```
 */
namespace RulesOfHooks {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": false,
   *     "properties": {
   *       "additionalHooks": {
   *         "type": "string"
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    additionalHooks?: string;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Validates the rules of hooks
 * @link https://react.dev/reference/eslint-plugin-react-hooks/lints/hooks
 *
 *  ```md
 *  | key            | value   |
 *  | :------------- | :------ |
 *  | type           | problem |
 *  | deprecated     | false   |
 *  | fixable        | code    |
 *  | hasSuggestions | true    |
 *  | recommended    | false   |
 *  ```
 */
namespace Hooks {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": true
   *   }
   * ]
   * ```
   */
  export type Options = UnknownRecord;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Validates against calling capitalized functions/methods instead of using JSX
 * @link https://react.dev/reference/eslint-plugin-react-hooks/lints/capitalized-calls
 *
 *  ```md
 *  | key            | value   |
 *  | :------------- | :------ |
 *  | type           | problem |
 *  | deprecated     | false   |
 *  | fixable        | code    |
 *  | hasSuggestions | true    |
 *  | recommended    | false   |
 *  ```
 */
namespace CapitalizedCalls {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": true
   *   }
   * ]
   * ```
   */
  export type Options = UnknownRecord;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Validates that components are static, not recreated every render. Components that are recreated dynamically can reset state and trigger excessive re-rendering
 * @link https://react.dev/reference/eslint-plugin-react-hooks/lints/static-components
 *
 *  ```md
 *  | key            | value   |
 *  | :------------- | :------ |
 *  | type           | problem |
 *  | deprecated     | false   |
 *  | fixable        | code    |
 *  | hasSuggestions | true    |
 *  | recommended    | true    |
 *  ```
 */
namespace StaticComponents {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": true
   *   }
   * ]
   * ```
   */
  export type Options = UnknownRecord;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Validates usage of the useMemo() hook against common mistakes. See [`useMemo()` docs](https://react.dev/reference/react/useMemo) for more information.
 * @link https://react.dev/reference/eslint-plugin-react-hooks/lints/use-memo
 *
 *  ```md
 *  | key            | value   |
 *  | :------------- | :------ |
 *  | type           | problem |
 *  | deprecated     | false   |
 *  | fixable        | code    |
 *  | hasSuggestions | true    |
 *  | recommended    | true    |
 *  ```
 */
namespace UseMemo {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": true
   *   }
   * ]
   * ```
   */
  export type Options = UnknownRecord;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Validates that useMemos always return a value and that the result of the useMemo is used by the component/hook. See [`useMemo()` docs](https://react.dev/reference/react/useMemo) for more information.
 * @link https://react.dev/reference/eslint-plugin-react-hooks/lints/void-use-memo
 *
 *  ```md
 *  | key            | value   |
 *  | :------------- | :------ |
 *  | type           | problem |
 *  | deprecated     | false   |
 *  | fixable        | code    |
 *  | hasSuggestions | true    |
 *  | recommended    | false   |
 *  ```
 */
namespace VoidUseMemo {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": true
   *   }
   * ]
   * ```
   */
  export type Options = UnknownRecord;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Validates that existing manual memoized is preserved by the compiler. React Compiler will only compile components and hooks if its inference [matches or exceeds the existing manual memoization](https://react.dev/learn/react-compiler/introduction#what-should-i-do-about-usememo-usecallback-and-reactmemo)
 * @link https://react.dev/reference/eslint-plugin-react-hooks/lints/preserve-manual-memoization
 *
 *  ```md
 *  | key            | value   |
 *  | :------------- | :------ |
 *  | type           | problem |
 *  | deprecated     | false   |
 *  | fixable        | code    |
 *  | hasSuggestions | true    |
 *  | recommended    | true    |
 *  ```
 */
namespace PreserveManualMemoization {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": true
   *   }
   * ]
   * ```
   */
  export type Options = UnknownRecord;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Validates that useMemo() and useCallback() specify comprehensive dependencies without extraneous values. See [`useMemo()` docs](https://react.dev/reference/react/useMemo) for more information.
 * @link https://react.dev/reference/eslint-plugin-react-hooks/lints/memo-dependencies
 *
 *  ```md
 *  | key            | value   |
 *  | :------------- | :------ |
 *  | type           | problem |
 *  | deprecated     | false   |
 *  | fixable        | code    |
 *  | hasSuggestions | true    |
 *  | recommended    | false   |
 *  ```
 */
namespace MemoDependencies {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": true
   *   }
   * ]
   * ```
   */
  export type Options = UnknownRecord;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Validates against usage of libraries which are incompatible with memoization (manual or automatic)
 * @link https://react.dev/reference/eslint-plugin-react-hooks/lints/incompatible-library
 *
 *  ```md
 *  | key            | value   |
 *  | :------------- | :------ |
 *  | type           | problem |
 *  | deprecated     | false   |
 *  | fixable        | code    |
 *  | hasSuggestions | true    |
 *  | recommended    | true    |
 *  ```
 */
namespace IncompatibleLibrary {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": true
   *   }
   * ]
   * ```
   */
  export type Options = UnknownRecord;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Validates against mutating props, state, and other values that [are immutable](https://react.dev/reference/rules/components-and-hooks-must-be-pure#props-and-state-are-immutable)
 * @link https://react.dev/reference/eslint-plugin-react-hooks/lints/immutability
 *
 *  ```md
 *  | key            | value   |
 *  | :------------- | :------ |
 *  | type           | problem |
 *  | deprecated     | false   |
 *  | fixable        | code    |
 *  | hasSuggestions | true    |
 *  | recommended    | true    |
 *  ```
 */
namespace Immutability {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": true
   *   }
   * ]
   * ```
   */
  export type Options = UnknownRecord;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Validates against assignment/mutation of globals during render, part of ensuring that [side effects must render outside of render](https://react.dev/reference/rules/components-and-hooks-must-be-pure#side-effects-must-run-outside-of-render)
 * @link https://react.dev/reference/eslint-plugin-react-hooks/lints/globals
 *
 *  ```md
 *  | key            | value   |
 *  | :------------- | :------ |
 *  | type           | problem |
 *  | deprecated     | false   |
 *  | fixable        | code    |
 *  | hasSuggestions | true    |
 *  | recommended    | true    |
 *  ```
 */
namespace Globals {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": true
   *   }
   * ]
   * ```
   */
  export type Options = UnknownRecord;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Validates correct usage of refs, not reading/writing during render. See the "pitfalls" section in [`useRef()` usage](https://react.dev/reference/react/useRef#usage)
 * @link https://react.dev/reference/eslint-plugin-react-hooks/lints/refs
 *
 *  ```md
 *  | key            | value   |
 *  | :------------- | :------ |
 *  | type           | problem |
 *  | deprecated     | false   |
 *  | fixable        | code    |
 *  | hasSuggestions | true    |
 *  | recommended    | true    |
 *  ```
 */
namespace Refs {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": true
   *   }
   * ]
   * ```
   */
  export type Options = UnknownRecord;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Validates that effect dependencies are memoized
 * @link https://react.dev/reference/eslint-plugin-react-hooks/lints/memoized-effect-dependencies
 *
 *  ```md
 *  | key            | value   |
 *  | :------------- | :------ |
 *  | type           | problem |
 *  | deprecated     | false   |
 *  | fixable        | code    |
 *  | hasSuggestions | true    |
 *  | recommended    | false   |
 *  ```
 */
namespace MemoizedEffectDependencies {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": true
   *   }
   * ]
   * ```
   */
  export type Options = UnknownRecord;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Validates that effect dependencies are exhaustive and without extraneous values
 * @link https://react.dev/reference/eslint-plugin-react-hooks/lints/exhaustive-effect-dependencies
 *
 *  ```md
 *  | key            | value   |
 *  | :------------- | :------ |
 *  | type           | problem |
 *  | deprecated     | false   |
 *  | fixable        | code    |
 *  | hasSuggestions | true    |
 *  | recommended    | false   |
 *  ```
 */
namespace ExhaustiveEffectDependencies {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": true
   *   }
   * ]
   * ```
   */
  export type Options = UnknownRecord;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Validates against calling setState synchronously in an effect. This can indicate non-local derived data, a derived event pattern, or improper external data synchronization.
 * @link https://react.dev/reference/eslint-plugin-react-hooks/lints/set-state-in-effect
 *
 *  ```md
 *  | key            | value   |
 *  | :------------- | :------ |
 *  | type           | problem |
 *  | deprecated     | false   |
 *  | fixable        | code    |
 *  | hasSuggestions | true    |
 *  | recommended    | true    |
 *  ```
 */
namespace SetStateInEffect {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": true
   *   }
   * ]
   * ```
   */
  export type Options = UnknownRecord;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Validates against deriving values from state in an effect
 * @link https://react.dev/reference/eslint-plugin-react-hooks/lints/no-deriving-state-in-effects
 *
 *  ```md
 *  | key            | value   |
 *  | :------------- | :------ |
 *  | type           | problem |
 *  | deprecated     | false   |
 *  | fixable        | code    |
 *  | hasSuggestions | true    |
 *  | recommended    | false   |
 *  ```
 */
namespace NoDerivingStateInEffects {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": true
   *   }
   * ]
   * ```
   */
  export type Options = UnknownRecord;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Validates usage of error boundaries instead of try/catch for errors in child components
 * @link https://react.dev/reference/eslint-plugin-react-hooks/lints/error-boundaries
 *
 *  ```md
 *  | key            | value   |
 *  | :------------- | :------ |
 *  | type           | problem |
 *  | deprecated     | false   |
 *  | fixable        | code    |
 *  | hasSuggestions | true    |
 *  | recommended    | true    |
 *  ```
 */
namespace ErrorBoundaries {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": true
   *   }
   * ]
   * ```
   */
  export type Options = UnknownRecord;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Validates that [components/hooks are pure](https://react.dev/reference/rules/components-and-hooks-must-be-pure) by checking that they do not call known-impure functions
 * @link https://react.dev/reference/eslint-plugin-react-hooks/lints/purity
 *
 *  ```md
 *  | key            | value   |
 *  | :------------- | :------ |
 *  | type           | problem |
 *  | deprecated     | false   |
 *  | fixable        | code    |
 *  | hasSuggestions | true    |
 *  | recommended    | true    |
 *  ```
 */
namespace Purity {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": true
   *   }
   * ]
   * ```
   */
  export type Options = UnknownRecord;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Validates against setting state during render, which can trigger additional renders and potential infinite render loops
 * @link https://react.dev/reference/eslint-plugin-react-hooks/lints/set-state-in-render
 *
 *  ```md
 *  | key            | value   |
 *  | :------------- | :------ |
 *  | type           | problem |
 *  | deprecated     | false   |
 *  | fixable        | code    |
 *  | hasSuggestions | true    |
 *  | recommended    | true    |
 *  ```
 */
namespace SetStateInRender {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": true
   *   }
   * ]
   * ```
   */
  export type Options = UnknownRecord;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Internal invariants
 * @link https://react.dev/reference/eslint-plugin-react-hooks/lints/invariant
 *
 *  ```md
 *  | key            | value   |
 *  | :------------- | :------ |
 *  | type           | problem |
 *  | deprecated     | false   |
 *  | fixable        | code    |
 *  | hasSuggestions | true    |
 *  | recommended    | false   |
 *  ```
 */
namespace Invariant {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": true
   *   }
   * ]
   * ```
   */
  export type Options = UnknownRecord;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Unimplemented features
 * @link https://react.dev/reference/eslint-plugin-react-hooks/lints/todo
 *
 *  ```md
 *  | key            | value   |
 *  | :------------- | :------ |
 *  | type           | problem |
 *  | deprecated     | false   |
 *  | fixable        | code    |
 *  | hasSuggestions | true    |
 *  | recommended    | false   |
 *  ```
 */
namespace Todo {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": true
   *   }
   * ]
   * ```
   */
  export type Options = UnknownRecord;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Validates against invalid syntax
 * @link https://react.dev/reference/eslint-plugin-react-hooks/lints/syntax
 *
 *  ```md
 *  | key            | value   |
 *  | :------------- | :------ |
 *  | type           | problem |
 *  | deprecated     | false   |
 *  | fixable        | code    |
 *  | hasSuggestions | true    |
 *  | recommended    | false   |
 *  ```
 */
namespace Syntax {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": true
   *   }
   * ]
   * ```
   */
  export type Options = UnknownRecord;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Validates against syntax that we do not plan to support in React Compiler
 * @link https://react.dev/reference/eslint-plugin-react-hooks/lints/unsupported-syntax
 *
 *  ```md
 *  | key            | value   |
 *  | :------------- | :------ |
 *  | type           | problem |
 *  | deprecated     | false   |
 *  | fixable        | code    |
 *  | hasSuggestions | true    |
 *  | recommended    | true    |
 *  ```
 */
namespace UnsupportedSyntax {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": true
   *   }
   * ]
   * ```
   */
  export type Options = UnknownRecord;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Validates the compiler configuration options
 * @link https://react.dev/reference/eslint-plugin-react-hooks/lints/config
 *
 *  ```md
 *  | key            | value   |
 *  | :------------- | :------ |
 *  | type           | problem |
 *  | deprecated     | false   |
 *  | fixable        | code    |
 *  | hasSuggestions | true    |
 *  | recommended    | true    |
 *  ```
 */
namespace Config {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": true
   *   }
   * ]
   * ```
   */
  export type Options = UnknownRecord;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Validates configuration of [gating mode](https://react.dev/reference/react-compiler/gating)
 * @link https://react.dev/reference/eslint-plugin-react-hooks/lints/gating
 *
 *  ```md
 *  | key            | value   |
 *  | :------------- | :------ |
 *  | type           | problem |
 *  | deprecated     | false   |
 *  | fixable        | code    |
 *  | hasSuggestions | true    |
 *  | recommended    | true    |
 *  ```
 */
namespace Gating {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": true
   *   }
   * ]
   * ```
   */
  export type Options = UnknownRecord;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Validates against suppression of other rules
 * @link https://react.dev/reference/eslint-plugin-react-hooks/lints/rule-suppression
 *
 *  ```md
 *  | key            | value   |
 *  | :------------- | :------ |
 *  | type           | problem |
 *  | deprecated     | false   |
 *  | fixable        | code    |
 *  | hasSuggestions | true    |
 *  | recommended    | false   |
 *  ```
 */
namespace RuleSuppression {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": true
   *   }
   * ]
   * ```
   */
  export type Options = UnknownRecord;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Validates usage of fbt
 * @link https://react.dev/reference/eslint-plugin-react-hooks/lints/fbt
 *
 *  ```md
 *  | key            | value   |
 *  | :------------- | :------ |
 *  | type           | problem |
 *  | deprecated     | false   |
 *  | fixable        | code    |
 *  | hasSuggestions | true    |
 *  | recommended    | false   |
 *  ```
 */
namespace Fbt {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "additionalProperties": true
   *   }
   * ]
   * ```
   */
  export type Options = UnknownRecord;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Deprecated: this rule has been removed in 7.1.0.
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | true       |
 *  ```
 */
namespace ComponentHookFactories {
  export type RuleEntry = 0;
}

export type EslintReactHooksRules = Readonly<{
  'react-hooks/exhaustive-deps': ExhaustiveDeps.RuleEntry;
  'react-hooks/rules-of-hooks': RulesOfHooks.RuleEntry;
  'react-hooks/hooks': Hooks.RuleEntry;
  'react-hooks/capitalized-calls': CapitalizedCalls.RuleEntry;
  'react-hooks/static-components': StaticComponents.RuleEntry;
  'react-hooks/use-memo': UseMemo.RuleEntry;
  'react-hooks/void-use-memo': VoidUseMemo.RuleEntry;
  'react-hooks/preserve-manual-memoization': PreserveManualMemoization.RuleEntry;
  'react-hooks/memo-dependencies': MemoDependencies.RuleEntry;
  'react-hooks/incompatible-library': IncompatibleLibrary.RuleEntry;
  'react-hooks/immutability': Immutability.RuleEntry;
  'react-hooks/globals': Globals.RuleEntry;
  'react-hooks/refs': Refs.RuleEntry;
  'react-hooks/memoized-effect-dependencies': MemoizedEffectDependencies.RuleEntry;
  'react-hooks/exhaustive-effect-dependencies': ExhaustiveEffectDependencies.RuleEntry;
  'react-hooks/set-state-in-effect': SetStateInEffect.RuleEntry;
  'react-hooks/no-deriving-state-in-effects': NoDerivingStateInEffects.RuleEntry;
  'react-hooks/error-boundaries': ErrorBoundaries.RuleEntry;
  'react-hooks/purity': Purity.RuleEntry;
  'react-hooks/set-state-in-render': SetStateInRender.RuleEntry;
  'react-hooks/invariant': Invariant.RuleEntry;
  'react-hooks/todo': Todo.RuleEntry;
  'react-hooks/syntax': Syntax.RuleEntry;
  'react-hooks/unsupported-syntax': UnsupportedSyntax.RuleEntry;
  'react-hooks/config': Config.RuleEntry;
  'react-hooks/gating': Gating.RuleEntry;
  'react-hooks/rule-suppression': RuleSuppression.RuleEntry;
  'react-hooks/fbt': Fbt.RuleEntry;

  // deprecated
  'react-hooks/component-hook-factories': ComponentHookFactories.RuleEntry;
}>;

export type EslintReactHooksRulesOption = Readonly<{
  'react-hooks/exhaustive-deps': ExhaustiveDeps.Options;
  'react-hooks/rules-of-hooks': RulesOfHooks.Options;
  'react-hooks/hooks': Hooks.Options;
  'react-hooks/capitalized-calls': CapitalizedCalls.Options;
  'react-hooks/static-components': StaticComponents.Options;
  'react-hooks/use-memo': UseMemo.Options;
  'react-hooks/void-use-memo': VoidUseMemo.Options;
  'react-hooks/preserve-manual-memoization': PreserveManualMemoization.Options;
  'react-hooks/memo-dependencies': MemoDependencies.Options;
  'react-hooks/incompatible-library': IncompatibleLibrary.Options;
  'react-hooks/immutability': Immutability.Options;
  'react-hooks/globals': Globals.Options;
  'react-hooks/refs': Refs.Options;
  'react-hooks/memoized-effect-dependencies': MemoizedEffectDependencies.Options;
  'react-hooks/exhaustive-effect-dependencies': ExhaustiveEffectDependencies.Options;
  'react-hooks/set-state-in-effect': SetStateInEffect.Options;
  'react-hooks/no-deriving-state-in-effects': NoDerivingStateInEffects.Options;
  'react-hooks/error-boundaries': ErrorBoundaries.Options;
  'react-hooks/purity': Purity.Options;
  'react-hooks/set-state-in-render': SetStateInRender.Options;
  'react-hooks/invariant': Invariant.Options;
  'react-hooks/todo': Todo.Options;
  'react-hooks/syntax': Syntax.Options;
  'react-hooks/unsupported-syntax': UnsupportedSyntax.Options;
  'react-hooks/config': Config.Options;
  'react-hooks/gating': Gating.Options;
  'react-hooks/rule-suppression': RuleSuppression.Options;
  'react-hooks/fbt': Fbt.Options;
}>;
