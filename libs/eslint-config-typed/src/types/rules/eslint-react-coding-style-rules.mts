/* cSpell:disable */
import { type Linter } from 'eslint';

type SpreadOptionsIfIsArray<
  T extends readonly [Linter.StringSeverity, unknown],
> = T[1] extends readonly unknown[]
  ? readonly [Linter.StringSeverity, ...T[1]]
  : T;

/**
 * Enforces naming conventions for variables assigned to React.memo(...)
 * components.
 *
 * ```md
 * | key        | value      |
 * | :--------- | :--------- |
 * | type       | suggestion |
 * | deprecated | false      |
 * ```
 */
namespace ComponentName {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "maxLength": {
   *         "type": "integer",
   *         "minimum": 1
   *       },
   *       "pattern": {
   *         "type": "object"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly maxLength?: number;
    readonly pattern?: UnknownRecord;
  };

  export type RuleEntry =
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Disallows using React.FC / React.FunctionComponent type annotations.
 *
 * ```md
 * | key        | value      |
 * | :--------- | :--------- |
 * | type       | suggestion |
 * | deprecated | false      |
 * ```
 */
namespace ComponentVarTypeAnnotation {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforces importing React with a single namespace import named 'React'.
 *
 * ```md
 * | key        | value      |
 * | :--------- | :--------- |
 * | type       | suggestion |
 * | deprecated | false      |
 * ```
 */
namespace ImportStyle {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Forbids annotating props directly in the arrow function passed to React.memo.
 *
 * ```md
 * | key        | value      |
 * | :--------- | :--------- |
 * | type       | suggestion |
 * | deprecated | false      |
 * ```
 */
namespace PropsTypeAnnotationStyle {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforces the arrow function passed to React.memo to use a single argument
 * named 'props'.
 *
 * ```md
 * | key        | value      |
 * | :--------- | :--------- |
 * | type       | suggestion |
 * | deprecated | false      |
 * ```
 */
namespace ReactMemoPropsArgumentName {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Requires React.memo calls to have the type parameter 'Props'.
 *
 * ```md
 * | key        | value      |
 * | :--------- | :--------- |
 * | type       | suggestion |
 * | deprecated | false      |
 * ```
 */
namespace ReactMemoTypeParameter {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Restricts React.useMemo hook usage patterns for consistent styles.
 *
 * ```md
 * | key        | value      |
 * | :--------- | :--------- |
 * | type       | suggestion |
 * | deprecated | false      |
 * ```
 */
namespace UseMemoHookStyle {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Restricts specific React hook usage patterns for consistent component styles.
 *
 * ```md
 * | key        | value      |
 * | :--------- | :--------- |
 * | type       | suggestion |
 * | deprecated | false      |
 * ```
 */
namespace BanUseImperativeHandleHook {
  export type RuleEntry = Linter.StringSeverity;
}

export type EslintReactCodingStyleRules = {
  readonly 'react-coding-style/component-name': ComponentName.RuleEntry;
  readonly 'react-coding-style/component-var-type-annotation': ComponentVarTypeAnnotation.RuleEntry;
  readonly 'react-coding-style/import-style': ImportStyle.RuleEntry;
  readonly 'react-coding-style/props-type-annotation-style': PropsTypeAnnotationStyle.RuleEntry;
  readonly 'react-coding-style/react-memo-props-argument-name': ReactMemoPropsArgumentName.RuleEntry;
  readonly 'react-coding-style/react-memo-type-parameter': ReactMemoTypeParameter.RuleEntry;
  readonly 'react-coding-style/use-memo-hook-style': UseMemoHookStyle.RuleEntry;
  readonly 'react-coding-style/ban-use-imperative-handle-hook': BanUseImperativeHandleHook.RuleEntry;
};

export type EslintReactCodingStyleRulesOption = {
  readonly 'react-coding-style/component-name': ComponentName.Options;
};
