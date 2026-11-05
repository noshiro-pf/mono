/* cSpell:disable */
import type { Linter } from 'eslint';
import type { UnknownRecord } from 'ts-type-forge';

/**
 * @description Enforces naming conventions for variables assigned to React.memo(...) components.
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  ```
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
    'off' | Linter.Severity | readonly [Linter.StringSeverity, Options];
}

/**
 * @description Disallows using React.FC / React.FunctionComponent type annotations.
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  ```
 */
namespace ComponentVarTypeAnnotation {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Enforces importing React with a specific style (namespace or named imports).
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  ```
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
     * Import style to enforce: "namespace" for `import * as React` or "named" for `import { ... }`
     */
    importStyle?: 'namespace' | 'named';
  }>;

  export type RuleEntry =
    'off' | Linter.Severity | readonly [Linter.StringSeverity, Options];
}

/**
 * @description Forbids annotating props directly in the arrow function passed to React.memo.
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  ```
 */
namespace PropsTypeAnnotationStyle {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Enforces the arrow function passed to React.memo to use a single argument named 'props'.
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  ```
 */
namespace ReactMemoPropsArgumentName {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Requires React.memo calls to have the type parameter 'Props'.
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  ```
 */
namespace ReactMemoTypeParameter {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Requires React components to be wrapped with React.memo.
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  ```
 */
namespace RequireReactMemo {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "ignoreName": {
   *         "description": "Component names allowed to be defined without memo.",
   *         "oneOf": [
   *           {
   *             "type": "string"
   *           },
   *           {
   *             "type": "array",
   *             "items": {
   *               "type": "string"
   *             },
   *             "minItems": 0
   *           }
   *         ]
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /**
     * Component names allowed to be defined without memo.
     */
    ignoreName?: string | readonly string[];
  }>;

  export type RuleEntry =
    'off' | Linter.Severity | readonly [Linter.StringSeverity, Options];
}

/**
 * @description Requires a value a React component or hook computes on every render to be memoized unless it is a primitive O(1) expression.
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  ```
 */
namespace RequireUseMemo {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "allowedCalls": {
   *         "description": "Functions whose call is O(1) and returns a primitive, in addition to the defaults (`Math.*`, `Number`, `Number.*`, `String`, `Boolean`, `Object.is`, `*.toFixed`, `*.toString`). `\"a.*\"` allows every `a.x`, and `\"*.x\"` every method `x`.",
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         }
   *       },
   *       "componentWrappers": {
   *         "description": "Higher order components besides `React.memo` and `React.forwardRef`: a function passed to them is a component.",
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         }
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /**
     * Functions whose call is O(1) and returns a primitive, in addition to the defaults (`Math.*`, `Number`, `Number.*`, `String`, `Boolean`, `Object.is`, `*.toFixed`, `*.toString`). `"a.*"` allows every `a.x`, and `"*.x"` every method `x`.
     */
    allowedCalls?: readonly string[];
    /**
     * Higher order components besides `React.memo` and `React.forwardRef`: a function passed to them is a component.
     */
    componentWrappers?: readonly string[];
  }>;

  export type RuleEntry =
    'off' | Linter.Severity | readonly [Linter.StringSeverity, Options];
}

/**
 * @description Requires a function that returns JSX to have only one return statement.
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  ```
 */
namespace SingleJsxReturn {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "componentWrappers": {
   *         "description": "Higher order components besides `React.memo` and `React.forwardRef`: a function passed to them is a component.",
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         }
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /**
     * Higher order components besides `React.memo` and `React.forwardRef`: a function passed to them is a component.
     */
    componentWrappers?: readonly string[];
  }>;

  export type RuleEntry =
    'off' | Linter.Severity | readonly [Linter.StringSeverity, Options];
}

/**
 * @description Restricts React.useMemo hook usage patterns for consistent styles.
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  ```
 */
namespace UseMemoHookStyle {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Restricts specific React hook usage patterns for consistent component styles.
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  ```
 */
namespace BanUseImperativeHandleHook {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Require React.memo components to define displayName matching the component name
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  ```
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
   *       "ignoreName": {
   *         "description": "Component names allowed to have displayName different from the variable name.",
   *         "oneOf": [
   *           {
   *             "type": "string"
   *           },
   *           {
   *             "type": "array",
   *             "items": {
   *               "type": "string"
   *             },
   *             "minItems": 0
   *           }
   *         ]
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /**
     * Component names allowed to have displayName different from the variable name.
     */
    ignoreName?: string | readonly string[];
  }>;

  export type RuleEntry =
    'off' | Linter.Severity | readonly [Linter.StringSeverity, Options];
}

export type EslintReactCodingStyleRules = Readonly<{
  'react-coding-style/component-name': ComponentName.RuleEntry;
  'react-coding-style/component-var-type-annotation': ComponentVarTypeAnnotation.RuleEntry;
  'react-coding-style/import-style': ImportStyle.RuleEntry;
  'react-coding-style/props-type-annotation-style': PropsTypeAnnotationStyle.RuleEntry;
  'react-coding-style/react-memo-props-argument-name': ReactMemoPropsArgumentName.RuleEntry;
  'react-coding-style/react-memo-type-parameter': ReactMemoTypeParameter.RuleEntry;
  'react-coding-style/require-react-memo': RequireReactMemo.RuleEntry;
  'react-coding-style/require-use-memo': RequireUseMemo.RuleEntry;
  'react-coding-style/single-jsx-return': SingleJsxReturn.RuleEntry;
  'react-coding-style/use-memo-hook-style': UseMemoHookStyle.RuleEntry;
  'react-coding-style/ban-use-imperative-handle-hook': BanUseImperativeHandleHook.RuleEntry;
  'react-coding-style/display-name': DisplayName.RuleEntry;
}>;

export type EslintReactCodingStyleRulesOption = Readonly<{
  'react-coding-style/component-name': ComponentName.Options;
  'react-coding-style/import-style': ImportStyle.Options;
  'react-coding-style/require-react-memo': RequireReactMemo.Options;
  'react-coding-style/require-use-memo': RequireUseMemo.Options;
  'react-coding-style/single-jsx-return': SingleJsxReturn.Options;
  'react-coding-style/display-name': DisplayName.Options;
}>;
