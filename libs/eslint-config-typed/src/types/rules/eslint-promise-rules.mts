/* cSpell:disable */
import { type Linter } from 'eslint';

type SpreadOptionsIfIsArray<
  T extends readonly [Linter.StringSeverity, unknown],
> = T[1] extends readonly unknown[]
  ? readonly [Linter.StringSeverity, ...T[1]]
  : T;

/**
 * @description Enforce consistent param names and ordering when creating new promises.
 * @link https://github.com/eslint-community/eslint-plugin-promise/blob/main/docs/rules/param-names.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  ```
 */
namespace ParamNames {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "resolvePattern": {
   *         "type": "string"
   *       },
   *       "rejectPattern": {
   *         "type": "string"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    resolvePattern?: string;
    rejectPattern?: string;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Disallow wrapping values in `Promise.resolve` or `Promise.reject` when not needed.
 * @link https://github.com/eslint-community/eslint-plugin-promise/blob/main/docs/rules/no-return-wrap.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  ```
 */
namespace NoReturnWrap {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "allowReject": {
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    allowReject?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Require returning inside each `then()` to create readable and reusable Promise chains.
 * @link https://github.com/eslint-community/eslint-plugin-promise/blob/main/docs/rules/always-return.md
 *
 *  ```md
 *  | key        | value   |
 *  | :--------- | :------ |
 *  | type       | problem |
 *  | deprecated | false   |
 *  ```
 */
namespace AlwaysReturn {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "ignoreLastCallback": {
   *         "type": "boolean"
   *       },
   *       "ignoreAssignmentVariable": {
   *         "type": "array",
   *         "items": {
   *           "type": "string",
   *           "pattern": "^[\\w$]+$"
   *         },
   *         "uniqueItems": true
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    ignoreLastCallback?: boolean;
    ignoreAssignmentVariable?: readonly string[];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Enforce the use of `catch()` on un-returned promises.
 * @link https://github.com/eslint-community/eslint-plugin-promise/blob/main/docs/rules/catch-or-return.md
 *
 *  ```md
 *  | key        | value   |
 *  | :--------- | :------ |
 *  | type       | problem |
 *  | deprecated | false   |
 *  ```
 */
namespace CatchOrReturn {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "allowFinally": {
   *         "type": "boolean"
   *       },
   *       "allowThen": {
   *         "type": "boolean"
   *       },
   *       "allowThenStrict": {
   *         "type": "boolean"
   *       },
   *       "terminationMethod": {
   *         "oneOf": [
   *           {
   *             "type": "string"
   *           },
   *           {
   *             "type": "array",
   *             "items": {
   *               "type": "string"
   *             }
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
    allowFinally?: boolean;
    allowThen?: boolean;
    allowThenStrict?: boolean;
    terminationMethod?: string | readonly string[];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Prefer `async`/`await` to the callback pattern.
 * @link https://github.com/eslint-community/eslint-plugin-promise/blob/main/docs/rules/prefer-await-to-callbacks.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  ```
 */
namespace PreferAwaitToCallbacks {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Prefer `await` to `then()`/`catch()`/`finally()` for reading Promise values.
 * @link https://github.com/eslint-community/eslint-plugin-promise/blob/main/docs/rules/prefer-await-to-then.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  ```
 */
namespace PreferAwaitToThen {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "strict": {
   *         "type": "boolean"
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    strict?: boolean;
    [k: string]: unknown;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Prefer `catch` to `then(a, b)`/`then(null, b)` for handling errors.
 * @link https://github.com/eslint-community/eslint-plugin-promise/blob/main/docs/rules/prefer-catch.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  | fixable    | code       |
 *  ```
 */
namespace PreferCatch {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Require creating a `Promise` constructor before using it in an ES5 environment.
 * @link https://github.com/eslint-community/eslint-plugin-promise/blob/main/docs/rules/no-native.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  ```
 */
namespace NoNative {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow calling `cb()` inside of a `then()` (use [util.callbackify][] instead).
 * @link https://github.com/eslint-community/eslint-plugin-promise/blob/main/docs/rules/no-callback-in-promise.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  ```
 */
namespace NoCallbackInPromise {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "exceptions": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         }
   *       },
   *       "timeoutsErr": {
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    exceptions?: readonly string[];
    timeoutsErr?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Disallow using promises inside of callbacks.
 * @link https://github.com/eslint-community/eslint-plugin-promise/blob/main/docs/rules/no-promise-in-callback.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  ```
 */
namespace NoPromiseInCallback {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow nested `then()` or `catch()` statements.
 * @link https://github.com/eslint-community/eslint-plugin-promise/blob/main/docs/rules/no-nesting.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  ```
 */
namespace NoNesting {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow creating `new` promises outside of utility libs (use [util.promisify][] instead).
 * @link https://github.com/eslint-community/eslint-plugin-promise/blob/main/docs/rules/avoid-new.md
 *
 *  ```md
 *  | key        | value      |
 *  | :--------- | :--------- |
 *  | type       | suggestion |
 *  | deprecated | false      |
 *  ```
 */
namespace AvoidNew {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow calling `new` on a Promise static method.
 * @link https://github.com/eslint-community/eslint-plugin-promise/blob/main/docs/rules/no-new-statics.md
 *
 *  ```md
 *  | key        | value   |
 *  | :--------- | :------ |
 *  | type       | problem |
 *  | deprecated | false   |
 *  | fixable    | code    |
 *  ```
 */
namespace NoNewStatics {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow return statements in `finally()`.
 * @link https://github.com/eslint-community/eslint-plugin-promise/blob/main/docs/rules/no-return-in-finally.md
 *
 *  ```md
 *  | key        | value   |
 *  | :--------- | :------ |
 *  | type       | problem |
 *  | deprecated | false   |
 *  ```
 */
namespace NoReturnInFinally {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Enforces the proper number of arguments are passed to Promise functions.
 * @link https://github.com/eslint-community/eslint-plugin-promise/blob/main/docs/rules/valid-params.md
 *
 *  ```md
 *  | key        | value   |
 *  | :--------- | :------ |
 *  | type       | problem |
 *  | deprecated | false   |
 *  ```
 */
namespace ValidParams {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "exclude": {
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
    exclude?: readonly string[];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description Disallow creating new promises with paths that resolve multiple times.
 * @link https://github.com/eslint-community/eslint-plugin-promise/blob/main/docs/rules/no-multiple-resolved.md
 *
 *  ```md
 *  | key        | value   |
 *  | :--------- | :------ |
 *  | type       | problem |
 *  | deprecated | false   |
 *  ```
 */
namespace NoMultipleResolved {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description Disallow use of non-standard Promise static methods.
 * @link https://github.com/eslint-community/eslint-plugin-promise/blob/main/docs/rules/spec-only.md
 *
 *  ```md
 *  | key        | value   |
 *  | :--------- | :------ |
 *  | type       | problem |
 *  | deprecated | false   |
 *  ```
 */
namespace SpecOnly {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "allowedMethods": {
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
    allowedMethods?: readonly string[];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

export type EslintPromiseRules = Readonly<{
  'promise/param-names': ParamNames.RuleEntry;
  'promise/no-return-wrap': NoReturnWrap.RuleEntry;
  'promise/always-return': AlwaysReturn.RuleEntry;
  'promise/catch-or-return': CatchOrReturn.RuleEntry;
  'promise/prefer-await-to-callbacks': PreferAwaitToCallbacks.RuleEntry;
  'promise/prefer-await-to-then': PreferAwaitToThen.RuleEntry;
  'promise/prefer-catch': PreferCatch.RuleEntry;
  'promise/no-native': NoNative.RuleEntry;
  'promise/no-callback-in-promise': NoCallbackInPromise.RuleEntry;
  'promise/no-promise-in-callback': NoPromiseInCallback.RuleEntry;
  'promise/no-nesting': NoNesting.RuleEntry;
  'promise/avoid-new': AvoidNew.RuleEntry;
  'promise/no-new-statics': NoNewStatics.RuleEntry;
  'promise/no-return-in-finally': NoReturnInFinally.RuleEntry;
  'promise/valid-params': ValidParams.RuleEntry;
  'promise/no-multiple-resolved': NoMultipleResolved.RuleEntry;
  'promise/spec-only': SpecOnly.RuleEntry;
}>;

export type EslintPromiseRulesOption = Readonly<{
  'promise/param-names': ParamNames.Options;
  'promise/no-return-wrap': NoReturnWrap.Options;
  'promise/always-return': AlwaysReturn.Options;
  'promise/catch-or-return': CatchOrReturn.Options;
  'promise/prefer-await-to-then': PreferAwaitToThen.Options;
  'promise/no-callback-in-promise': NoCallbackInPromise.Options;
  'promise/valid-params': ValidParams.Options;
  'promise/spec-only': SpecOnly.Options;
}>;
