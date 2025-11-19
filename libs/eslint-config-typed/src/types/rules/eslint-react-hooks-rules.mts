/* cSpell:disable */
import { type Linter } from 'eslint';

type SpreadOptionsIfIsArray<
  T extends readonly [Linter.StringSeverity, unknown],
> = T[1] extends readonly unknown[]
  ? readonly [Linter.StringSeverity, ...T[1]]
  : T;

/**
 * Verifies the list of dependencies for Hooks like useEffect and similar
 *
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
 * Enforces the Rules of Hooks
 *
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
 * Validates the rules of hooks
 *
 * ```md
 * | key            | value   |
 * | :------------- | :------ |
 * | type           | problem |
 * | deprecated     | false   |
 * | fixable        | code    |
 * | hasSuggestions | true    |
 * | recommended    | false   |
 * ```
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
 * Validates against calling capitalized functions/methods instead of using JSX
 *
 * ```md
 * | key            | value   |
 * | :------------- | :------ |
 * | type           | problem |
 * | deprecated     | false   |
 * | fixable        | code    |
 * | hasSuggestions | true    |
 * | recommended    | false   |
 * ```
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
 * Validates that components are static, not recreated every render. Components
 * that are recreated dynamically can reset state and trigger excessive
 * re-rendering
 *
 * ```md
 * | key            | value   |
 * | :------------- | :------ |
 * | type           | problem |
 * | deprecated     | false   |
 * | fixable        | code    |
 * | hasSuggestions | true    |
 * | recommended    | true    |
 * ```
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
 * Validates usage of the useMemo() hook against common mistakes. See
 * [`useMemo()` docs](https://react.dev/reference/react/useMemo) for more
 * information.
 *
 * ```md
 * | key            | value   |
 * | :------------- | :------ |
 * | type           | problem |
 * | deprecated     | false   |
 * | fixable        | code    |
 * | hasSuggestions | true    |
 * | recommended    | true    |
 * ```
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
 * Validates that useMemos always return a value and that the result of the
 * useMemo is used by the component/hook. See [`useMemo()`
 * docs](https://react.dev/reference/react/useMemo) for more information.
 *
 * ```md
 * | key            | value   |
 * | :------------- | :------ |
 * | type           | problem |
 * | deprecated     | false   |
 * | fixable        | code    |
 * | hasSuggestions | true    |
 * | recommended    | false   |
 * ```
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
 * Validates against higher order functions defining nested components or hooks.
 * Components and hooks should be defined at the module level
 *
 * ```md
 * | key            | value   |
 * | :------------- | :------ |
 * | type           | problem |
 * | deprecated     | false   |
 * | fixable        | code    |
 * | hasSuggestions | true    |
 * | recommended    | true    |
 * ```
 */
namespace ComponentHookFactories {
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
 * Validates that existing manual memoized is preserved by the compiler. React
 * Compiler will only compile components and hooks if its inference [matches or
 * exceeds the existing manual
 * memoization](https://react.dev/learn/react-compiler/introduction#what-should-i-do-about-usememo-usecallback-and-reactmemo)
 *
 * ```md
 * | key            | value   |
 * | :------------- | :------ |
 * | type           | problem |
 * | deprecated     | false   |
 * | fixable        | code    |
 * | hasSuggestions | true    |
 * | recommended    | true    |
 * ```
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
 * Validates against usage of libraries which are incompatible with memoization
 * (manual or automatic)
 *
 * ```md
 * | key            | value   |
 * | :------------- | :------ |
 * | type           | problem |
 * | deprecated     | false   |
 * | fixable        | code    |
 * | hasSuggestions | true    |
 * | recommended    | true    |
 * ```
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
 * Validates against mutating props, state, and other values that [are
 * immutable](https://react.dev/reference/rules/components-and-hooks-must-be-pure#props-and-state-are-immutable)
 *
 * ```md
 * | key            | value   |
 * | :------------- | :------ |
 * | type           | problem |
 * | deprecated     | false   |
 * | fixable        | code    |
 * | hasSuggestions | true    |
 * | recommended    | true    |
 * ```
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
 * Validates against assignment/mutation of globals during render, part of
 * ensuring that [side effects must render outside of
 * render](https://react.dev/reference/rules/components-and-hooks-must-be-pure#side-effects-must-run-outside-of-render)
 *
 * ```md
 * | key            | value   |
 * | :------------- | :------ |
 * | type           | problem |
 * | deprecated     | false   |
 * | fixable        | code    |
 * | hasSuggestions | true    |
 * | recommended    | true    |
 * ```
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
 * Validates correct usage of refs, not reading/writing during render. See the
 * "pitfalls" section in [`useRef()`
 * usage](https://react.dev/reference/react/useRef#usage)
 *
 * ```md
 * | key            | value   |
 * | :------------- | :------ |
 * | type           | problem |
 * | deprecated     | false   |
 * | fixable        | code    |
 * | hasSuggestions | true    |
 * | recommended    | true    |
 * ```
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
 * Validates that effect dependencies are memoized
 *
 * ```md
 * | key            | value   |
 * | :------------- | :------ |
 * | type           | problem |
 * | deprecated     | false   |
 * | fixable        | code    |
 * | hasSuggestions | true    |
 * | recommended    | false   |
 * ```
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
 * Validates against calling setState synchronously in an effect, which can lead
 * to re-renders that degrade performance
 *
 * ```md
 * | key            | value   |
 * | :------------- | :------ |
 * | type           | problem |
 * | deprecated     | false   |
 * | fixable        | code    |
 * | hasSuggestions | true    |
 * | recommended    | true    |
 * ```
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
 * Validates against deriving values from state in an effect
 *
 * ```md
 * | key            | value   |
 * | :------------- | :------ |
 * | type           | problem |
 * | deprecated     | false   |
 * | fixable        | code    |
 * | hasSuggestions | true    |
 * | recommended    | false   |
 * ```
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
 * Validates usage of error boundaries instead of try/catch for errors in child
 * components
 *
 * ```md
 * | key            | value   |
 * | :------------- | :------ |
 * | type           | problem |
 * | deprecated     | false   |
 * | fixable        | code    |
 * | hasSuggestions | true    |
 * | recommended    | true    |
 * ```
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
 * Validates that [components/hooks are
 * pure](https://react.dev/reference/rules/components-and-hooks-must-be-pure) by
 * checking that they do not call known-impure functions
 *
 * ```md
 * | key            | value   |
 * | :------------- | :------ |
 * | type           | problem |
 * | deprecated     | false   |
 * | fixable        | code    |
 * | hasSuggestions | true    |
 * | recommended    | true    |
 * ```
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
 * Validates against setting state during render, which can trigger additional
 * renders and potential infinite render loops
 *
 * ```md
 * | key            | value   |
 * | :------------- | :------ |
 * | type           | problem |
 * | deprecated     | false   |
 * | fixable        | code    |
 * | hasSuggestions | true    |
 * | recommended    | true    |
 * ```
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
 * Internal invariants
 *
 * ```md
 * | key            | value   |
 * | :------------- | :------ |
 * | type           | problem |
 * | deprecated     | false   |
 * | fixable        | code    |
 * | hasSuggestions | true    |
 * | recommended    | false   |
 * ```
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
 * Unimplemented features
 *
 * ```md
 * | key            | value   |
 * | :------------- | :------ |
 * | type           | problem |
 * | deprecated     | false   |
 * | fixable        | code    |
 * | hasSuggestions | true    |
 * | recommended    | false   |
 * ```
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
 * Validates against invalid syntax
 *
 * ```md
 * | key            | value   |
 * | :------------- | :------ |
 * | type           | problem |
 * | deprecated     | false   |
 * | fixable        | code    |
 * | hasSuggestions | true    |
 * | recommended    | false   |
 * ```
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
 * Validates against syntax that we do not plan to support in React Compiler
 *
 * ```md
 * | key            | value   |
 * | :------------- | :------ |
 * | type           | problem |
 * | deprecated     | false   |
 * | fixable        | code    |
 * | hasSuggestions | true    |
 * | recommended    | true    |
 * ```
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
 * Validates the compiler configuration options
 *
 * ```md
 * | key            | value   |
 * | :------------- | :------ |
 * | type           | problem |
 * | deprecated     | false   |
 * | fixable        | code    |
 * | hasSuggestions | true    |
 * | recommended    | true    |
 * ```
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
 * Validates configuration of [gating
 * mode](https://react.dev/reference/react-compiler/gating)
 *
 * ```md
 * | key            | value   |
 * | :------------- | :------ |
 * | type           | problem |
 * | deprecated     | false   |
 * | fixable        | code    |
 * | hasSuggestions | true    |
 * | recommended    | true    |
 * ```
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
 * Validates against suppression of other rules
 *
 * ```md
 * | key            | value   |
 * | :------------- | :------ |
 * | type           | problem |
 * | deprecated     | false   |
 * | fixable        | code    |
 * | hasSuggestions | true    |
 * | recommended    | false   |
 * ```
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
 * Verifies that automatic effect dependencies are compiled if opted-in
 *
 * ```md
 * | key            | value   |
 * | :------------- | :------ |
 * | type           | problem |
 * | deprecated     | false   |
 * | fixable        | code    |
 * | hasSuggestions | true    |
 * | recommended    | false   |
 * ```
 */
namespace AutomaticEffectDependencies {
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
 * Validates usage of `fire`
 *
 * ```md
 * | key            | value   |
 * | :------------- | :------ |
 * | type           | problem |
 * | deprecated     | false   |
 * | fixable        | code    |
 * | hasSuggestions | true    |
 * | recommended    | false   |
 * ```
 */
namespace Fire {
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
 * Validates usage of fbt
 *
 * ```md
 * | key            | value   |
 * | :------------- | :------ |
 * | type           | problem |
 * | deprecated     | false   |
 * | fixable        | code    |
 * | hasSuggestions | true    |
 * | recommended    | false   |
 * ```
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

export type EslintReactHooksRules = Readonly<{
  'react-hooks/exhaustive-deps': ExhaustiveDeps.RuleEntry;
  'react-hooks/rules-of-hooks': RulesOfHooks.RuleEntry;
  'react-hooks/hooks': Hooks.RuleEntry;
  'react-hooks/capitalized-calls': CapitalizedCalls.RuleEntry;
  'react-hooks/static-components': StaticComponents.RuleEntry;
  'react-hooks/use-memo': UseMemo.RuleEntry;
  'react-hooks/void-use-memo': VoidUseMemo.RuleEntry;
  'react-hooks/component-hook-factories': ComponentHookFactories.RuleEntry;
  'react-hooks/preserve-manual-memoization': PreserveManualMemoization.RuleEntry;
  'react-hooks/incompatible-library': IncompatibleLibrary.RuleEntry;
  'react-hooks/immutability': Immutability.RuleEntry;
  'react-hooks/globals': Globals.RuleEntry;
  'react-hooks/refs': Refs.RuleEntry;
  'react-hooks/memoized-effect-dependencies': MemoizedEffectDependencies.RuleEntry;
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
  'react-hooks/automatic-effect-dependencies': AutomaticEffectDependencies.RuleEntry;
  'react-hooks/fire': Fire.RuleEntry;
  'react-hooks/fbt': Fbt.RuleEntry;
}>;

export type EslintReactHooksRulesOption = Readonly<{
  'react-hooks/exhaustive-deps': ExhaustiveDeps.Options;
  'react-hooks/rules-of-hooks': RulesOfHooks.Options;
  'react-hooks/hooks': Hooks.Options;
  'react-hooks/capitalized-calls': CapitalizedCalls.Options;
  'react-hooks/static-components': StaticComponents.Options;
  'react-hooks/use-memo': UseMemo.Options;
  'react-hooks/void-use-memo': VoidUseMemo.Options;
  'react-hooks/component-hook-factories': ComponentHookFactories.Options;
  'react-hooks/preserve-manual-memoization': PreserveManualMemoization.Options;
  'react-hooks/incompatible-library': IncompatibleLibrary.Options;
  'react-hooks/immutability': Immutability.Options;
  'react-hooks/globals': Globals.Options;
  'react-hooks/refs': Refs.Options;
  'react-hooks/memoized-effect-dependencies': MemoizedEffectDependencies.Options;
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
  'react-hooks/automatic-effect-dependencies': AutomaticEffectDependencies.Options;
  'react-hooks/fire': Fire.Options;
  'react-hooks/fbt': Fbt.Options;
}>;
