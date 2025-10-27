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
  export type Options = {
    readonly additionalHooks?: string;
    readonly enableDangerousAutofixThisMayCauseInfiniteLoops?: boolean;
    readonly experimental_autoDependenciesHooks?: readonly string[];
    readonly requireExplicitEffectDeps?: boolean;
  };

  export type RuleEntry =
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
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
  export type Options = {
    readonly additionalHooks?: string;
  };

  export type RuleEntry =
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
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
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
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
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
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
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
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
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
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
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
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
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
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
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
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
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
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
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
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
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
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
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
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
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
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
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
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
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
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
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
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
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
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
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
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
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
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
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
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
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
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
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
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
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
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
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
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
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
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
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
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
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
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
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

export type EslintReactHooksRules = {
  readonly 'react-hooks/exhaustive-deps': ExhaustiveDeps.RuleEntry;
  readonly 'react-hooks/rules-of-hooks': RulesOfHooks.RuleEntry;
  readonly 'react-hooks/hooks': Hooks.RuleEntry;
  readonly 'react-hooks/capitalized-calls': CapitalizedCalls.RuleEntry;
  readonly 'react-hooks/static-components': StaticComponents.RuleEntry;
  readonly 'react-hooks/use-memo': UseMemo.RuleEntry;
  readonly 'react-hooks/void-use-memo': VoidUseMemo.RuleEntry;
  readonly 'react-hooks/component-hook-factories': ComponentHookFactories.RuleEntry;
  readonly 'react-hooks/preserve-manual-memoization': PreserveManualMemoization.RuleEntry;
  readonly 'react-hooks/incompatible-library': IncompatibleLibrary.RuleEntry;
  readonly 'react-hooks/immutability': Immutability.RuleEntry;
  readonly 'react-hooks/globals': Globals.RuleEntry;
  readonly 'react-hooks/refs': Refs.RuleEntry;
  readonly 'react-hooks/memoized-effect-dependencies': MemoizedEffectDependencies.RuleEntry;
  readonly 'react-hooks/set-state-in-effect': SetStateInEffect.RuleEntry;
  readonly 'react-hooks/no-deriving-state-in-effects': NoDerivingStateInEffects.RuleEntry;
  readonly 'react-hooks/error-boundaries': ErrorBoundaries.RuleEntry;
  readonly 'react-hooks/purity': Purity.RuleEntry;
  readonly 'react-hooks/set-state-in-render': SetStateInRender.RuleEntry;
  readonly 'react-hooks/invariant': Invariant.RuleEntry;
  readonly 'react-hooks/todo': Todo.RuleEntry;
  readonly 'react-hooks/syntax': Syntax.RuleEntry;
  readonly 'react-hooks/unsupported-syntax': UnsupportedSyntax.RuleEntry;
  readonly 'react-hooks/config': Config.RuleEntry;
  readonly 'react-hooks/gating': Gating.RuleEntry;
  readonly 'react-hooks/rule-suppression': RuleSuppression.RuleEntry;
  readonly 'react-hooks/automatic-effect-dependencies': AutomaticEffectDependencies.RuleEntry;
  readonly 'react-hooks/fire': Fire.RuleEntry;
  readonly 'react-hooks/fbt': Fbt.RuleEntry;
};

export type EslintReactHooksRulesOption = {
  readonly 'react-hooks/exhaustive-deps': ExhaustiveDeps.Options;
  readonly 'react-hooks/rules-of-hooks': RulesOfHooks.Options;
  readonly 'react-hooks/hooks': Hooks.Options;
  readonly 'react-hooks/capitalized-calls': CapitalizedCalls.Options;
  readonly 'react-hooks/static-components': StaticComponents.Options;
  readonly 'react-hooks/use-memo': UseMemo.Options;
  readonly 'react-hooks/void-use-memo': VoidUseMemo.Options;
  readonly 'react-hooks/component-hook-factories': ComponentHookFactories.Options;
  readonly 'react-hooks/preserve-manual-memoization': PreserveManualMemoization.Options;
  readonly 'react-hooks/incompatible-library': IncompatibleLibrary.Options;
  readonly 'react-hooks/immutability': Immutability.Options;
  readonly 'react-hooks/globals': Globals.Options;
  readonly 'react-hooks/refs': Refs.Options;
  readonly 'react-hooks/memoized-effect-dependencies': MemoizedEffectDependencies.Options;
  readonly 'react-hooks/set-state-in-effect': SetStateInEffect.Options;
  readonly 'react-hooks/no-deriving-state-in-effects': NoDerivingStateInEffects.Options;
  readonly 'react-hooks/error-boundaries': ErrorBoundaries.Options;
  readonly 'react-hooks/purity': Purity.Options;
  readonly 'react-hooks/set-state-in-render': SetStateInRender.Options;
  readonly 'react-hooks/invariant': Invariant.Options;
  readonly 'react-hooks/todo': Todo.Options;
  readonly 'react-hooks/syntax': Syntax.Options;
  readonly 'react-hooks/unsupported-syntax': UnsupportedSyntax.Options;
  readonly 'react-hooks/config': Config.Options;
  readonly 'react-hooks/gating': Gating.Options;
  readonly 'react-hooks/rule-suppression': RuleSuppression.Options;
  readonly 'react-hooks/automatic-effect-dependencies': AutomaticEffectDependencies.Options;
  readonly 'react-hooks/fire': Fire.Options;
  readonly 'react-hooks/fbt': Fbt.Options;
};
