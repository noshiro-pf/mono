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
  export type Options = Readonly<{
    maxLength?: number;
    pattern?: UnknownRecord;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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
 * Enforces importing React with a specific style (namespace or named imports).
 *
 * ```md
 * | key        | value      |
 * | :--------- | :--------- |
 * | type       | suggestion |
 * | deprecated | false      |
 * ```
 */
namespace ImportStyle {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "importStyle": {
   *         "type": "string",
   *         "enum": [
   *           "namespace",
   *           "named"
   *         ],
   *         "description": "Import style to enforce: \"namespace\" for `import * as React` or \"named\" for `import { ... }`"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /**
     * Import style to enforce: "namespace" for `import * as React` or "named"
     * for `import { ... }`
     */
    importStyle?: 'namespace' | 'named';
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
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

/**
 * Require displayName property for React components created with React.memo
 *
 * ```md
 * | key        | value      |
 * | :--------- | :--------- |
 * | type       | suggestion |
 * | deprecated | false      |
 * ```
 */
namespace DisplayName {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "ignoreTranspilerName": {
   *         "type": "boolean",
   *         "description": "When true, ignores components that get displayName from variable name"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /** When true, ignores components that get displayName from variable name */
    ignoreTranspilerName?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

export type EslintReactCodingStyleRules = Readonly<{
  'react-coding-style/component-name': ComponentName.RuleEntry;
  'react-coding-style/component-var-type-annotation': ComponentVarTypeAnnotation.RuleEntry;
  'react-coding-style/import-style': ImportStyle.RuleEntry;
  'react-coding-style/props-type-annotation-style': PropsTypeAnnotationStyle.RuleEntry;
  'react-coding-style/react-memo-props-argument-name': ReactMemoPropsArgumentName.RuleEntry;
  'react-coding-style/react-memo-type-parameter': ReactMemoTypeParameter.RuleEntry;
  'react-coding-style/use-memo-hook-style': UseMemoHookStyle.RuleEntry;
  'react-coding-style/ban-use-imperative-handle-hook': BanUseImperativeHandleHook.RuleEntry;
  'react-coding-style/display-name': DisplayName.RuleEntry;
}>;

export type EslintReactCodingStyleRulesOption = Readonly<{
  'react-coding-style/component-name': ComponentName.Options;
  'react-coding-style/import-style': ImportStyle.Options;
  'react-coding-style/display-name': DisplayName.Options;
}>;
