/* cSpell:disable */
import { type Linter } from 'eslint';
import { type RuleSeverityWithDefaultOption } from '../rule-severity-branded.mjs';

type SpreadOptionsIfIsArray<
  T extends readonly [Linter.StringSeverity, unknown],
> = T[1] extends readonly unknown[]
  ? readonly [Linter.StringSeverity, ...T[1]]
  : T;

/**
 * Enforce consistent param names and ordering when creating new promises.
 *
 * @link https://github.com/eslint-community/eslint-plugin-promise/blob/main/docs/rules/param-names.md
 *
 *  ```md
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
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
  export type Options = {
    readonly resolvePattern?: string;
    readonly rejectPattern?: string;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Disallow wrapping values in `Promise.resolve` or `Promise.reject` when not
 * needed.
 *
 * @link https://github.com/eslint-community/eslint-plugin-promise/blob/main/docs/rules/no-return-wrap.md
 *
 *  ```md
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
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
  export type Options = {
    readonly allowReject?: boolean;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Require returning inside each `then()` to create readable and reusable
 * Promise chains.
 *
 * @link https://github.com/eslint-community/eslint-plugin-promise/blob/main/docs/rules/always-return.md
 *
 *  ```md
 *  | key  | value   |
 *  | :--- | :------ |
 *  | type | problem |
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
  export type Options = {
    readonly ignoreLastCallback?: boolean;
    readonly ignoreAssignmentVariable?: readonly string[];
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Enforce the use of `catch()` on un-returned promises.
 *
 * @link https://github.com/eslint-community/eslint-plugin-promise/blob/main/docs/rules/catch-or-return.md
 *
 *  ```md
 *  | key  | value   |
 *  | :--- | :------ |
 *  | type | problem |
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
  export type Options = {
    readonly allowFinally?: boolean;
    readonly allowThen?: boolean;
    readonly allowThenStrict?: boolean;
    readonly terminationMethod?: string | readonly string[];
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Prefer `async`/`await` to the callback pattern.
 *
 * @link https://github.com/eslint-community/eslint-plugin-promise/blob/main/docs/rules/prefer-await-to-callbacks.md
 *
 *  ```md
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
 *  ```
 */
namespace PreferAwaitToCallbacks {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Prefer `await` to `then()`/`catch()`/`finally()` for reading Promise values.
 *
 * @link https://github.com/eslint-community/eslint-plugin-promise/blob/main/docs/rules/prefer-await-to-then.md
 *
 *  ```md
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
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
  export type Options = {
    readonly strict?: boolean;
    readonly [k: string]: unknown;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Prefer `catch` to `then(a, b)`/`then(null, b)` for handling errors.
 *
 * @link https://github.com/eslint-community/eslint-plugin-promise/blob/main/docs/rules/prefer-catch.md
 *
 *  ```md
 *  | key     | value      |
 *  | :------ | :--------- |
 *  | type    | suggestion |
 *  | fixable | code       |
 *  ```
 */
namespace PreferCatch {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Require creating a `Promise` constructor before using it in an ES5
 * environment.
 *
 * @link https://github.com/eslint-community/eslint-plugin-promise/blob/main/docs/rules/no-native.md
 *
 *  ```md
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
 *  ```
 */
namespace NoNative {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow calling `cb()` inside of a `then()` (use [util.callbackify][]
 * instead).
 *
 * @link https://github.com/eslint-community/eslint-plugin-promise/blob/main/docs/rules/no-callback-in-promise.md
 *
 *  ```md
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
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
  export type Options = {
    readonly exceptions?: readonly string[];
    readonly timeoutsErr?: boolean;
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Disallow using promises inside of callbacks.
 *
 * @link https://github.com/eslint-community/eslint-plugin-promise/blob/main/docs/rules/no-promise-in-callback.md
 *
 *  ```md
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
 *  ```
 */
namespace NoPromiseInCallback {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow nested `then()` or `catch()` statements.
 *
 * @link https://github.com/eslint-community/eslint-plugin-promise/blob/main/docs/rules/no-nesting.md
 *
 *  ```md
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
 *  ```
 */
namespace NoNesting {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow creating `new` promises outside of utility libs (use
 * [util.promisify][] instead).
 *
 * @link https://github.com/eslint-community/eslint-plugin-promise/blob/main/docs/rules/avoid-new.md
 *
 *  ```md
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
 *  ```
 */
namespace AvoidNew {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow calling `new` on a Promise static method.
 *
 * @link https://github.com/eslint-community/eslint-plugin-promise/blob/main/docs/rules/no-new-statics.md
 *
 *  ```md
 *  | key     | value   |
 *  | :------ | :------ |
 *  | type    | problem |
 *  | fixable | code    |
 *  ```
 */
namespace NoNewStatics {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow return statements in `finally()`.
 *
 * @link https://github.com/eslint-community/eslint-plugin-promise/blob/main/docs/rules/no-return-in-finally.md
 *
 *  ```md
 *  | key  | value   |
 *  | :--- | :------ |
 *  | type | problem |
 *  ```
 */
namespace NoReturnInFinally {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Enforces the proper number of arguments are passed to Promise functions.
 *
 * @link https://github.com/eslint-community/eslint-plugin-promise/blob/main/docs/rules/valid-params.md
 *
 *  ```md
 *  | key  | value   |
 *  | :--- | :------ |
 *  | type | problem |
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
  export type Options = {
    readonly exclude?: readonly string[];
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

/**
 * Disallow creating new promises with paths that resolve multiple times.
 *
 * @link https://github.com/eslint-community/eslint-plugin-promise/blob/main/docs/rules/no-multiple-resolved.md
 *
 *  ```md
 *  | key  | value   |
 *  | :--- | :------ |
 *  | type | problem |
 *  ```
 */
namespace NoMultipleResolved {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * Disallow use of non-standard Promise static methods.
 *
 * @link https://github.com/eslint-community/eslint-plugin-promise/blob/main/docs/rules/spec-only.md
 *
 *  ```md
 *  | key  | value   |
 *  | :--- | :------ |
 *  | type | problem |
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
  export type Options = {
    readonly allowedMethods?: readonly string[];
  };

  export type RuleEntry =
    | RuleSeverityWithDefaultOption
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>
    | 'off';
}

export type EslintPromiseRules = {
  readonly 'promise/param-names': ParamNames.RuleEntry;
  readonly 'promise/no-return-wrap': NoReturnWrap.RuleEntry;
  readonly 'promise/always-return': AlwaysReturn.RuleEntry;
  readonly 'promise/catch-or-return': CatchOrReturn.RuleEntry;
  readonly 'promise/prefer-await-to-callbacks': PreferAwaitToCallbacks.RuleEntry;
  readonly 'promise/prefer-await-to-then': PreferAwaitToThen.RuleEntry;
  readonly 'promise/prefer-catch': PreferCatch.RuleEntry;
  readonly 'promise/no-native': NoNative.RuleEntry;
  readonly 'promise/no-callback-in-promise': NoCallbackInPromise.RuleEntry;
  readonly 'promise/no-promise-in-callback': NoPromiseInCallback.RuleEntry;
  readonly 'promise/no-nesting': NoNesting.RuleEntry;
  readonly 'promise/avoid-new': AvoidNew.RuleEntry;
  readonly 'promise/no-new-statics': NoNewStatics.RuleEntry;
  readonly 'promise/no-return-in-finally': NoReturnInFinally.RuleEntry;
  readonly 'promise/valid-params': ValidParams.RuleEntry;
  readonly 'promise/no-multiple-resolved': NoMultipleResolved.RuleEntry;
  readonly 'promise/spec-only': SpecOnly.RuleEntry;
};

export type EslintPromiseRulesOption = {
  readonly 'promise/param-names': ParamNames.Options;
  readonly 'promise/no-return-wrap': NoReturnWrap.Options;
  readonly 'promise/always-return': AlwaysReturn.Options;
  readonly 'promise/catch-or-return': CatchOrReturn.Options;
  readonly 'promise/prefer-await-to-then': PreferAwaitToThen.Options;
  readonly 'promise/no-callback-in-promise': NoCallbackInPromise.Options;
  readonly 'promise/valid-params': ValidParams.Options;
  readonly 'promise/spec-only': SpecOnly.Options;
};
