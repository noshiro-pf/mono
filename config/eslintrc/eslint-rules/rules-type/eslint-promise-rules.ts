/* cSpell:disable */
/* eslint-disable @typescript-eslint/sort-type-union-intersection-members */
import type { Linter } from 'eslint';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type SpreadOptionsIfIsArray<T extends readonly [Linter.RuleLevel, unknown]> =
  T[1] extends readonly unknown[] ? readonly [Linter.RuleLevel, ...T[1]] : T;

/**
 * @link https://github.com/xjamundx/eslint-plugin-promise/blob/master/docs/rules/param-names.md
 *
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
 */
namespace ParamNames {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @link https://github.com/xjamundx/eslint-plugin-promise/blob/master/docs/rules/no-return-wrap.md
 *
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
 */
namespace NoReturnWrap {
  /**
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
   */
  export type Options = {
    readonly allowReject?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @link https://github.com/xjamundx/eslint-plugin-promise/blob/master/docs/rules/always-return.md
 *
 *  | key  | value   |
 *  | :--- | :------ |
 *  | type | problem |
 */
namespace AlwaysReturn {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @link https://github.com/xjamundx/eslint-plugin-promise/blob/master/docs/rules/catch-or-return.md
 *
 *  | key  | value   |
 *  | :--- | :------ |
 *  | type | problem |
 */
namespace CatchOrReturn {
  /**
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
   */
  export type Options = {
    readonly allowFinally?: boolean;
    readonly allowThen?: boolean;
    readonly terminationMethod?: string | readonly string[];
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @link https://github.com/xjamundx/eslint-plugin-promise/blob/master/docs/rules/prefer-await-to-callbacks.md
 *
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
 */
namespace PreferAwaitToCallbacks {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @link https://github.com/xjamundx/eslint-plugin-promise/blob/master/docs/rules/prefer-await-to-then.md
 *
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
 */
namespace PreferAwaitToThen {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @link https://github.com/xjamundx/eslint-plugin-promise/blob/master/docs/rules/no-native.md
 *
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
 */
namespace NoNative {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @link https://github.com/xjamundx/eslint-plugin-promise/blob/master/docs/rules/no-callback-in-promise.md
 *
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
 */
namespace NoCallbackInPromise {
  /**
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "exceptions": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         }
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   */
  export type Options = {
    readonly exceptions?: readonly string[];
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @link https://github.com/xjamundx/eslint-plugin-promise/blob/master/docs/rules/no-promise-in-callback.md
 *
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
 */
namespace NoPromiseInCallback {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @link https://github.com/xjamundx/eslint-plugin-promise/blob/master/docs/rules/no-nesting.md
 *
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
 */
namespace NoNesting {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @link https://github.com/xjamundx/eslint-plugin-promise/blob/master/docs/rules/avoid-new.md
 *
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
 */
namespace AvoidNew {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @link https://github.com/xjamundx/eslint-plugin-promise/blob/master/docs/rules/no-new-statics.md
 *
 *  | key     | value   |
 *  | :------ | :------ |
 *  | type    | problem |
 *  | fixable | code    |
 */
namespace NoNewStatics {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @link https://github.com/xjamundx/eslint-plugin-promise/blob/master/docs/rules/no-return-in-finally.md
 *
 *  | key  | value   |
 *  | :--- | :------ |
 *  | type | problem |
 */
namespace NoReturnInFinally {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Ensures the proper number of arguments are passed to Promise functions
 * @link https://github.com/xjamundx/eslint-plugin-promise/blob/master/docs/rules/valid-params.md
 *
 *  | key  | value   |
 *  | :--- | :------ |
 *  | type | problem |
 */
namespace ValidParams {
  export type RuleEntry = Linter.RuleLevel;
}

export type EslintPromiseRules = {
  readonly 'promise/param-names': ParamNames.RuleEntry;
  readonly 'promise/no-return-wrap': NoReturnWrap.RuleEntry;
  readonly 'promise/always-return': AlwaysReturn.RuleEntry;
  readonly 'promise/catch-or-return': CatchOrReturn.RuleEntry;
  readonly 'promise/prefer-await-to-callbacks': PreferAwaitToCallbacks.RuleEntry;
  readonly 'promise/prefer-await-to-then': PreferAwaitToThen.RuleEntry;
  readonly 'promise/no-native': NoNative.RuleEntry;
  readonly 'promise/no-callback-in-promise': NoCallbackInPromise.RuleEntry;
  readonly 'promise/no-promise-in-callback': NoPromiseInCallback.RuleEntry;
  readonly 'promise/no-nesting': NoNesting.RuleEntry;
  readonly 'promise/avoid-new': AvoidNew.RuleEntry;
  readonly 'promise/no-new-statics': NoNewStatics.RuleEntry;
  readonly 'promise/no-return-in-finally': NoReturnInFinally.RuleEntry;
  readonly 'promise/valid-params': ValidParams.RuleEntry;
};
