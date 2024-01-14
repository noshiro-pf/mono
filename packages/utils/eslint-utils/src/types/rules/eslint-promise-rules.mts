/* cSpell:disable */
import { type Linter } from 'eslint';

type SpreadOptionsIfIsArray<T extends readonly [Linter.RuleLevel, unknown]> =
  T[1] extends readonly unknown[] ? readonly [Linter.RuleLevel, ...T[1]] : T;

/**
 * @link https://github.com/eslint-community/eslint-plugin-promise/blob/main/docs/rules/param-names.md
 *
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
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
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @link https://github.com/eslint-community/eslint-plugin-promise/blob/main/docs/rules/no-return-wrap.md
 *
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
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
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @link https://github.com/eslint-community/eslint-plugin-promise/blob/main/docs/rules/always-return.md
 *
 *  | key  | value   |
 *  | :--- | :------ |
 *  | type | problem |
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
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly ignoreLastCallback?: boolean;
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @link https://github.com/eslint-community/eslint-plugin-promise/blob/main/docs/rules/catch-or-return.md
 *
 *  | key  | value   |
 *  | :--- | :------ |
 *  | type | problem |
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
    readonly terminationMethod?: string | readonly string[];
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @link https://github.com/eslint-community/eslint-plugin-promise/blob/main/docs/rules/prefer-await-to-callbacks.md
 *
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
 */
namespace PreferAwaitToCallbacks {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @link https://github.com/eslint-community/eslint-plugin-promise/blob/main/docs/rules/prefer-await-to-then.md
 *
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
 */
namespace PreferAwaitToThen {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @link https://github.com/eslint-community/eslint-plugin-promise/blob/main/docs/rules/no-native.md
 *
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
 */
namespace NoNative {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @link https://github.com/eslint-community/eslint-plugin-promise/blob/main/docs/rules/no-callback-in-promise.md
 *
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
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
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = {
    readonly exceptions?: readonly string[];
  };

  export type RuleEntry =
    | Linter.RuleLevel
    | SpreadOptionsIfIsArray<readonly [Linter.RuleLevel, Options]>;
}

/**
 * @link https://github.com/eslint-community/eslint-plugin-promise/blob/main/docs/rules/no-promise-in-callback.md
 *
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
 */
namespace NoPromiseInCallback {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @link https://github.com/eslint-community/eslint-plugin-promise/blob/main/docs/rules/no-nesting.md
 *
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
 */
namespace NoNesting {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @link https://github.com/eslint-community/eslint-plugin-promise/blob/main/docs/rules/avoid-new.md
 *
 *  | key  | value      |
 *  | :--- | :--------- |
 *  | type | suggestion |
 */
namespace AvoidNew {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @link https://github.com/eslint-community/eslint-plugin-promise/blob/main/docs/rules/no-new-statics.md
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
 * @link https://github.com/eslint-community/eslint-plugin-promise/blob/main/docs/rules/no-return-in-finally.md
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
 * @link https://github.com/eslint-community/eslint-plugin-promise/blob/main/docs/rules/valid-params.md
 *
 *  | key  | value   |
 *  | :--- | :------ |
 *  | type | problem |
 */
namespace ValidParams {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @link https://github.com/eslint-community/eslint-plugin-promise/blob/main/docs/rules/no-multiple-resolved.md
 *
 *  | key  | value   |
 *  | :--- | :------ |
 *  | type | problem |
 */
namespace NoMultipleResolved {
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
  readonly 'promise/no-multiple-resolved': NoMultipleResolved.RuleEntry;
};

export type EslintPromiseRulesOption = {
  readonly 'promise/param-names': ParamNames.Options;
  readonly 'promise/no-return-wrap': NoReturnWrap.Options;
  readonly 'promise/always-return': AlwaysReturn.Options;
  readonly 'promise/catch-or-return': CatchOrReturn.Options;
  readonly 'promise/no-callback-in-promise': NoCallbackInPromise.Options;
};
