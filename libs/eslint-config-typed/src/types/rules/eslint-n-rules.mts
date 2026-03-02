/* cSpell:disable */
import { type Linter } from 'eslint';

type SpreadOptionsIfIsArray<
  T extends readonly [Linter.StringSeverity, unknown],
> = T[1] extends readonly unknown[]
  ? readonly [Linter.StringSeverity, ...T[1]]
  : T;

/**
 * @description require `return` statements after callbacks
 * @link https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/callback-return.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | false      |
 *  ```
 */
namespace CallbackReturn {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "array",
   *     "items": {
   *       "type": "string"
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = readonly string[];

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description enforce either `module.exports` or `exports`
 * @link https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/exports-style.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | fixable     | code       |
 *  | recommended | false      |
 *  ```
 */
namespace ExportsStyle {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "enum": [
   *       "module.exports",
   *       "exports"
   *     ]
   *   },
   *   {
   *     "type": "object",
   *     "properties": {
   *       "allowBatchAssign": {
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options0 = 'module.exports' | 'exports';

  export type Options1 = Readonly<{
    allowBatchAssign?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | readonly [Linter.StringSeverity, Options0]
    | readonly [Linter.StringSeverity, Options0, Options1];
}

/**
 * @description enforce the style of file extensions in `import` declarations
 * @link https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/file-extension-in-import.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | fixable     | code       |
 *  | recommended | false      |
 *  ```
 */
namespace FileExtensionInImport {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "enum": [
   *       "always",
   *       "never"
   *     ]
   *   },
   *   {
   *     "type": "object",
   *     "properties": {},
   *     "additionalProperties": {
   *       "enum": [
   *         "always",
   *         "never"
   *       ]
   *     }
   *   }
   * ]
   * ```
   */
  export type Options0 = 'always' | 'never';

  export type Options1 = Readonly<Record<string, 'always' | 'never'>>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | readonly [Linter.StringSeverity, Options0]
    | readonly [Linter.StringSeverity, Options0, Options1];
}

/**
 * @description require `require()` calls to be placed at top-level module scope
 * @link https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/global-require.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | false      |
 *  ```
 */
namespace GlobalRequire {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description require error handling in callbacks
 * @link https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/handle-callback-err.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | false      |
 *  ```
 */
namespace HandleCallbackErr {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "string"
   *   }
   * ]
   * ```
   */
  export type Options = string;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description enforce Node.js-style error-first callback pattern is followed
 * @link https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-callback-literal.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | false   |
 *  | recommended | false   |
 *  ```
 */
namespace NoCallbackLiteral {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description disallow deprecated APIs
 * @link https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-deprecated-api.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | false   |
 *  | recommended | true    |
 *  ```
 */
namespace NoDeprecatedApi {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "version": {
   *         "type": "string"
   *       },
   *       "ignoreModuleItems": {
   *         "type": "array",
   *         "items": {
   *           "enum": [
   *             "_linklist",
   *             "_stream_wrap",
   *             "async_hooks.currentId",
   *             "async_hooks.triggerId",
   *             "buffer.Buffer()",
   *             "new buffer.Buffer()",
   *             "buffer.SlowBuffer",
   *             "constants",
   *             "crypto._toBuf",
   *             "crypto.Credentials",
   *             "crypto.DEFAULT_ENCODING",
   *             "crypto.createCipher",
   *             "crypto.createCredentials",
   *             "crypto.createDecipher",
   *             "crypto.fips",
   *             "crypto.prng",
   *             "crypto.pseudoRandomBytes",
   *             "crypto.rng",
   *             "domain",
   *             "events.EventEmitter.listenerCount",
   *             "events.listenerCount",
   *             "freelist",
   *             "fs.SyncWriteStream",
   *             "fs.exists",
   *             "fs.lchmod",
   *             "fs.lchmodSync",
   *             "http.createClient",
   *             "module.Module.createRequireFromPath",
   *             "module.Module.requireRepl",
   *             "module.Module._debug",
   *             "module.createRequireFromPath",
   *             "module.requireRepl",
   *             "module._debug",
   *             "net._setSimultaneousAccepts",
   *             "os.getNetworkInterfaces",
   *             "os.tmpDir",
   *             "path._makeLong",
   *             "process.EventEmitter",
   *             "process.assert",
   *             "process.binding",
   *             "process.env.NODE_REPL_HISTORY_FILE",
   *             "process.report.triggerReport",
   *             "punycode",
   *             "readline.codePointAt",
   *             "readline.getStringWidth",
   *             "readline.isFullWidthCodePoint",
   *             "readline.stripVTControlCharacters",
   *             "repl.REPLServer",
   *             "repl.Recoverable",
   *             "repl.REPL_MODE_MAGIC",
   *             "repl.builtinModules",
   *             "safe-buffer.Buffer()",
   *             "new safe-buffer.Buffer()",
   *             "safe-buffer.SlowBuffer",
   *             "sys",
   *             "timers.enroll",
   *             "timers.unenroll",
   *             "tls.CleartextStream",
   *             "tls.CryptoStream",
   *             "tls.SecurePair",
   *             "tls.convertNPNProtocols",
   *             "tls.createSecurePair",
   *             "tls.parseCertString",
   *             "tty.setRawMode",
   *             "url.parse",
   *             "url.resolve",
   *             "util.debug",
   *             "util.error",
   *             "util.isArray",
   *             "util.isBoolean",
   *             "util.isBuffer",
   *             "util.isDate",
   *             "util.isError",
   *             "util.isFunction",
   *             "util.isNull",
   *             "util.isNullOrUndefined",
   *             "util.isNumber",
   *             "util.isObject",
   *             "util.isPrimitive",
   *             "util.isRegExp",
   *             "util.isString",
   *             "util.isSymbol",
   *             "util.isUndefined",
   *             "util.log",
   *             "util.print",
   *             "util.pump",
   *             "util.puts",
   *             "util._extend",
   *             "vm.runInDebugContext",
   *             "zlib.BrotliCompress()",
   *             "zlib.BrotliDecompress()",
   *             "zlib.Deflate()",
   *             "zlib.DeflateRaw()",
   *             "zlib.Gunzip()",
   *             "zlib.Gzip()",
   *             "zlib.Inflate()",
   *             "zlib.InflateRaw()",
   *             "zlib.Unzip()"
   *           ]
   *         },
   *         "additionalItems": false,
   *         "uniqueItems": true
   *       },
   *       "ignoreGlobalItems": {
   *         "type": "array",
   *         "items": {
   *           "enum": [
   *             "Buffer()",
   *             "new Buffer()",
   *             "COUNTER_NET_SERVER_CONNECTION",
   *             "COUNTER_NET_SERVER_CONNECTION_CLOSE",
   *             "COUNTER_HTTP_SERVER_REQUEST",
   *             "COUNTER_HTTP_SERVER_RESPONSE",
   *             "COUNTER_HTTP_CLIENT_REQUEST",
   *             "COUNTER_HTTP_CLIENT_RESPONSE",
   *             "GLOBAL",
   *             "Intl.v8BreakIterator",
   *             "require.extensions",
   *             "root",
   *             "process.EventEmitter",
   *             "process.assert",
   *             "process.binding",
   *             "process.env.NODE_REPL_HISTORY_FILE",
   *             "process.report.triggerReport"
   *           ]
   *         },
   *         "additionalItems": false,
   *         "uniqueItems": true
   *       },
   *       "ignoreIndirectDependencies": {
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    version?: string;
    ignoreModuleItems?: readonly (
      | '_linklist'
      | '_stream_wrap'
      | 'async_hooks.currentId'
      | 'async_hooks.triggerId'
      | 'buffer.Buffer()'
      | 'new buffer.Buffer()'
      | 'buffer.SlowBuffer'
      | 'constants'
      | 'crypto._toBuf'
      | 'crypto.Credentials'
      | 'crypto.DEFAULT_ENCODING'
      | 'crypto.createCipher'
      | 'crypto.createCredentials'
      | 'crypto.createDecipher'
      | 'crypto.fips'
      | 'crypto.prng'
      | 'crypto.pseudoRandomBytes'
      | 'crypto.rng'
      | 'domain'
      | 'events.EventEmitter.listenerCount'
      | 'events.listenerCount'
      | 'freelist'
      | 'fs.SyncWriteStream'
      | 'fs.exists'
      | 'fs.lchmod'
      | 'fs.lchmodSync'
      | 'http.createClient'
      | 'module.Module.createRequireFromPath'
      | 'module.Module.requireRepl'
      | 'module.Module._debug'
      | 'module.createRequireFromPath'
      | 'module.requireRepl'
      | 'module._debug'
      | 'net._setSimultaneousAccepts'
      | 'os.getNetworkInterfaces'
      | 'os.tmpDir'
      | 'path._makeLong'
      | 'process.EventEmitter'
      | 'process.assert'
      | 'process.binding'
      | 'process.env.NODE_REPL_HISTORY_FILE'
      | 'process.report.triggerReport'
      | 'punycode'
      | 'readline.codePointAt'
      | 'readline.getStringWidth'
      | 'readline.isFullWidthCodePoint'
      | 'readline.stripVTControlCharacters'
      | 'repl.REPLServer'
      | 'repl.Recoverable'
      | 'repl.REPL_MODE_MAGIC'
      | 'repl.builtinModules'
      | 'safe-buffer.Buffer()'
      | 'new safe-buffer.Buffer()'
      | 'safe-buffer.SlowBuffer'
      | 'sys'
      | 'timers.enroll'
      | 'timers.unenroll'
      | 'tls.CleartextStream'
      | 'tls.CryptoStream'
      | 'tls.SecurePair'
      | 'tls.convertNPNProtocols'
      | 'tls.createSecurePair'
      | 'tls.parseCertString'
      | 'tty.setRawMode'
      | 'url.parse'
      | 'url.resolve'
      | 'util.debug'
      | 'util.error'
      | 'util.isArray'
      | 'util.isBoolean'
      | 'util.isBuffer'
      | 'util.isDate'
      | 'util.isError'
      | 'util.isFunction'
      | 'util.isNull'
      | 'util.isNullOrUndefined'
      | 'util.isNumber'
      | 'util.isObject'
      | 'util.isPrimitive'
      | 'util.isRegExp'
      | 'util.isString'
      | 'util.isSymbol'
      | 'util.isUndefined'
      | 'util.log'
      | 'util.print'
      | 'util.pump'
      | 'util.puts'
      | 'util._extend'
      | 'vm.runInDebugContext'
      | 'zlib.BrotliCompress()'
      | 'zlib.BrotliDecompress()'
      | 'zlib.Deflate()'
      | 'zlib.DeflateRaw()'
      | 'zlib.Gunzip()'
      | 'zlib.Gzip()'
      | 'zlib.Inflate()'
      | 'zlib.InflateRaw()'
      | 'zlib.Unzip()'
    )[];
    ignoreGlobalItems?: readonly (
      | 'Buffer()'
      | 'new Buffer()'
      | 'COUNTER_NET_SERVER_CONNECTION'
      | 'COUNTER_NET_SERVER_CONNECTION_CLOSE'
      | 'COUNTER_HTTP_SERVER_REQUEST'
      | 'COUNTER_HTTP_SERVER_RESPONSE'
      | 'COUNTER_HTTP_CLIENT_REQUEST'
      | 'COUNTER_HTTP_CLIENT_RESPONSE'
      | 'GLOBAL'
      | 'Intl.v8BreakIterator'
      | 'require.extensions'
      | 'root'
      | 'process.EventEmitter'
      | 'process.assert'
      | 'process.binding'
      | 'process.env.NODE_REPL_HISTORY_FILE'
      | 'process.report.triggerReport'
    )[];
    ignoreIndirectDependencies?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description disallow the assignment to `exports`
 * @link https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-exports-assign.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | false   |
 *  | recommended | true    |
 *  ```
 */
namespace NoExportsAssign {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description disallow `import` declarations which import extraneous modules
 * @link https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-extraneous-import.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | false   |
 *  | recommended | true    |
 *  ```
 */
namespace NoExtraneousImport {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "allowModules": {
   *         "type": "array",
   *         "items": {
   *           "type": "string",
   *           "pattern": "^(?:virtual:)?(?:@[a-zA-Z0-9_\\-.]+/)?[a-zA-Z0-9_\\-.]+$"
   *         },
   *         "uniqueItems": true
   *       },
   *       "convertPath": {
   *         "anyOf": [
   *           {
   *             "type": "object",
   *             "properties": {},
   *             "patternProperties": {
   *               "^.+$": {
   *                 "type": "array",
   *                 "items": {
   *                   "type": "string"
   *                 },
   *                 "minItems": 2,
   *                 "maxItems": 2
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           {
   *             "type": "array",
   *             "items": {
   *               "type": "object",
   *               "properties": {
   *                 "include": {
   *                   "type": "array",
   *                   "items": {
   *                     "type": "string"
   *                   },
   *                   "minItems": 1,
   *                   "uniqueItems": true
   *                 },
   *                 "exclude": {
   *                   "type": "array",
   *                   "items": {
   *                     "type": "string"
   *                   },
   *                   "uniqueItems": true
   *                 },
   *                 "replace": {
   *                   "type": "array",
   *                   "items": {
   *                     "type": "string"
   *                   },
   *                   "minItems": 2,
   *                   "maxItems": 2
   *                 }
   *               },
   *               "additionalProperties": false,
   *               "required": [
   *                 "include",
   *                 "replace"
   *               ]
   *             },
   *             "minItems": 1
   *           }
   *         ]
   *       },
   *       "resolvePaths": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         },
   *         "uniqueItems": true
   *       },
   *       "resolverConfig": {
   *         "type": "object",
   *         "properties": {},
   *         "additionalProperties": true
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    allowModules?: readonly string[];
    convertPath?:
      | Readonly<Record<string, readonly [string, string]>>
      | readonly [
          Readonly<{
            /**
             * @minItems 1
             */
            include: readonly [string, ...string[]];
            exclude?: readonly string[];
            /**
             * @minItems 2
             * @maxItems 2
             */
            replace: readonly [string, string];
          }>,
          ...Readonly<{
            /**
             * @minItems 1
             */
            include: readonly [string, ...string[]];
            exclude?: readonly string[];
            /**
             * @minItems 2
             * @maxItems 2
             */
            replace: readonly [string, string];
          }>[],
        ];
    resolvePaths?: readonly string[];
    resolverConfig?: UnknownRecord;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description disallow `require()` expressions which import extraneous modules
 * @link https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-extraneous-require.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | false   |
 *  | recommended | true    |
 *  ```
 */
namespace NoExtraneousRequire {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "allowModules": {
   *         "type": "array",
   *         "items": {
   *           "type": "string",
   *           "pattern": "^(?:virtual:)?(?:@[a-zA-Z0-9_\\-.]+/)?[a-zA-Z0-9_\\-.]+$"
   *         },
   *         "uniqueItems": true
   *       },
   *       "convertPath": {
   *         "anyOf": [
   *           {
   *             "type": "object",
   *             "properties": {},
   *             "patternProperties": {
   *               "^.+$": {
   *                 "type": "array",
   *                 "items": {
   *                   "type": "string"
   *                 },
   *                 "minItems": 2,
   *                 "maxItems": 2
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           {
   *             "type": "array",
   *             "items": {
   *               "type": "object",
   *               "properties": {
   *                 "include": {
   *                   "type": "array",
   *                   "items": {
   *                     "type": "string"
   *                   },
   *                   "minItems": 1,
   *                   "uniqueItems": true
   *                 },
   *                 "exclude": {
   *                   "type": "array",
   *                   "items": {
   *                     "type": "string"
   *                   },
   *                   "uniqueItems": true
   *                 },
   *                 "replace": {
   *                   "type": "array",
   *                   "items": {
   *                     "type": "string"
   *                   },
   *                   "minItems": 2,
   *                   "maxItems": 2
   *                 }
   *               },
   *               "additionalProperties": false,
   *               "required": [
   *                 "include",
   *                 "replace"
   *               ]
   *             },
   *             "minItems": 1
   *           }
   *         ]
   *       },
   *       "resolvePaths": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         },
   *         "uniqueItems": true
   *       },
   *       "resolverConfig": {
   *         "type": "object",
   *         "properties": {},
   *         "additionalProperties": true
   *       },
   *       "tryExtensions": {
   *         "type": "array",
   *         "items": {
   *           "type": "string",
   *           "pattern": "^\\."
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
    allowModules?: readonly string[];
    convertPath?:
      | Readonly<Record<string, readonly [string, string]>>
      | readonly [
          Readonly<{
            /**
             * @minItems 1
             */
            include: readonly [string, ...string[]];
            exclude?: readonly string[];
            /**
             * @minItems 2
             * @maxItems 2
             */
            replace: readonly [string, string];
          }>,
          ...Readonly<{
            /**
             * @minItems 1
             */
            include: readonly [string, ...string[]];
            exclude?: readonly string[];
            /**
             * @minItems 2
             * @maxItems 2
             */
            replace: readonly [string, string];
          }>[],
        ];
    resolvePaths?: readonly string[];
    resolverConfig?: UnknownRecord;
    tryExtensions?: readonly string[];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description disallow `import` declarations which import missing modules
 * @link https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-missing-import.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | false   |
 *  | recommended | true    |
 *  ```
 */
namespace NoMissingImport {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "allowModules": {
   *         "type": "array",
   *         "items": {
   *           "type": "string",
   *           "pattern": "^(?:virtual:)?(?:@[a-zA-Z0-9_\\-.]+/)?[a-zA-Z0-9_\\-.]+$"
   *         },
   *         "uniqueItems": true
   *       },
   *       "resolvePaths": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         },
   *         "uniqueItems": true
   *       },
   *       "resolverConfig": {
   *         "type": "object",
   *         "properties": {},
   *         "additionalProperties": true
   *       },
   *       "tryExtensions": {
   *         "type": "array",
   *         "items": {
   *           "type": "string",
   *           "pattern": "^\\."
   *         },
   *         "uniqueItems": true
   *       },
   *       "ignoreTypeImport": {
   *         "type": "boolean",
   *         "default": false
   *       },
   *       "tsconfigPath": {
   *         "type": "string"
   *       },
   *       "typescriptExtensionMap": {
   *         "oneOf": [
   *           {
   *             "type": "array",
   *             "items": {
   *               "type": "array",
   *               "prefixItems": [
   *                 {
   *                   "type": "string",
   *                   "pattern": "^(?:|\\.\\w+)$"
   *                 },
   *                 {
   *                   "type": "string",
   *                   "pattern": "^\\.\\w+$"
   *                 }
   *               ],
   *               "additionalItems": false
   *             },
   *             "uniqueItems": true
   *           },
   *           {
   *             "type": "string",
   *             "enum": [
   *               "react",
   *               "react-jsx",
   *               "react-jsxdev",
   *               "react-native",
   *               "preserve"
   *             ]
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
    allowModules?: readonly string[];
    resolvePaths?: readonly string[];
    resolverConfig?: UnknownRecord;
    tryExtensions?: readonly string[];
    /**
     * @default false
     */
    ignoreTypeImport?: boolean;
    tsconfigPath?: string;
    typescriptExtensionMap?:
      | readonly (readonly unknown[])[]
      | ('react' | 'react-jsx' | 'react-jsxdev' | 'react-native' | 'preserve');
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description disallow `require()` expressions which import missing modules
 * @link https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-missing-require.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | false   |
 *  | recommended | true    |
 *  ```
 */
namespace NoMissingRequire {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "allowModules": {
   *         "type": "array",
   *         "items": {
   *           "type": "string",
   *           "pattern": "^(?:virtual:)?(?:@[a-zA-Z0-9_\\-.]+/)?[a-zA-Z0-9_\\-.]+$"
   *         },
   *         "uniqueItems": true
   *       },
   *       "tryExtensions": {
   *         "type": "array",
   *         "items": {
   *           "type": "string",
   *           "pattern": "^\\."
   *         },
   *         "uniqueItems": true
   *       },
   *       "resolvePaths": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         },
   *         "uniqueItems": true
   *       },
   *       "resolverConfig": {
   *         "type": "object",
   *         "properties": {},
   *         "additionalProperties": true
   *       },
   *       "typescriptExtensionMap": {
   *         "oneOf": [
   *           {
   *             "type": "array",
   *             "items": {
   *               "type": "array",
   *               "prefixItems": [
   *                 {
   *                   "type": "string",
   *                   "pattern": "^(?:|\\.\\w+)$"
   *                 },
   *                 {
   *                   "type": "string",
   *                   "pattern": "^\\.\\w+$"
   *                 }
   *               ],
   *               "additionalItems": false
   *             },
   *             "uniqueItems": true
   *           },
   *           {
   *             "type": "string",
   *             "enum": [
   *               "react",
   *               "react-jsx",
   *               "react-jsxdev",
   *               "react-native",
   *               "preserve"
   *             ]
   *           }
   *         ]
   *       },
   *       "tsconfigPath": {
   *         "type": "string"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    allowModules?: readonly string[];
    tryExtensions?: readonly string[];
    resolvePaths?: readonly string[];
    resolverConfig?: UnknownRecord;
    typescriptExtensionMap?:
      | readonly (readonly unknown[])[]
      | ('react' | 'react-jsx' | 'react-jsxdev' | 'react-native' | 'preserve');
    tsconfigPath?: string;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description disallow `require` calls to be mixed with regular variable declarations
 * @link https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-mixed-requires.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | false      |
 *  ```
 */
namespace NoMixedRequires {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "oneOf": [
   *       {
   *         "type": "boolean"
   *       },
   *       {
   *         "type": "object",
   *         "properties": {
   *           "grouping": {
   *             "type": "boolean"
   *           },
   *           "allowCall": {
   *             "type": "boolean"
   *           }
   *         },
   *         "additionalProperties": false
   *       }
   *     ]
   *   }
   * ]
   * ```
   */
  export type Options =
    | boolean
    | Readonly<{
        grouping?: boolean;
        allowCall?: boolean;
      }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description disallow `new` operators with calls to `require`
 * @link https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-new-require.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | false      |
 *  ```
 */
namespace NoNewRequire {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description disallow string concatenation with `__dirname` and `__filename`
 * @link https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-path-concat.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | false      |
 *  ```
 */
namespace NoPathConcat {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description disallow the use of `process.env`
 * @link https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-process-env.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | false      |
 *  ```
 */
namespace NoProcessEnv {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "allowedVariables": {
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
    allowedVariables?: readonly string[];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description disallow the use of `process.exit()`
 * @link https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-process-exit.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | true       |
 *  ```
 */
namespace NoProcessExit {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description disallow specified modules when loaded by `import` declarations
 * @link https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-restricted-import.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | false      |
 *  ```
 */
namespace NoRestrictedImport {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "array",
   *     "items": {
   *       "anyOf": [
   *         {
   *           "type": "string"
   *         },
   *         {
   *           "type": "object",
   *           "properties": {
   *             "name": {
   *               "anyOf": [
   *                 {
   *                   "type": "string"
   *                 },
   *                 {
   *                   "type": "array",
   *                   "items": {
   *                     "type": "string"
   *                   },
   *                   "additionalItems": false
   *                 }
   *               ]
   *             },
   *             "message": {
   *               "type": "string"
   *             }
   *           },
   *           "additionalProperties": false,
   *           "required": [
   *             "name"
   *           ]
   *         }
   *       ]
   *     },
   *     "additionalItems": false
   *   }
   * ]
   * ```
   */
  export type Options = readonly (
    | string
    | Readonly<{
        name: string | readonly string[];
        message?: string;
      }>
  )[];

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description disallow specified modules when loaded by `require`
 * @link https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-restricted-require.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | false      |
 *  ```
 */
namespace NoRestrictedRequire {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "array",
   *     "items": {
   *       "anyOf": [
   *         {
   *           "type": "string"
   *         },
   *         {
   *           "type": "object",
   *           "properties": {
   *             "name": {
   *               "anyOf": [
   *                 {
   *                   "type": "string"
   *                 },
   *                 {
   *                   "type": "array",
   *                   "items": {
   *                     "type": "string"
   *                   },
   *                   "additionalItems": false
   *                 }
   *               ]
   *             },
   *             "message": {
   *               "type": "string"
   *             }
   *           },
   *           "additionalProperties": false,
   *           "required": [
   *             "name"
   *           ]
   *         }
   *       ]
   *     },
   *     "additionalItems": false
   *   }
   * ]
   * ```
   */
  export type Options = readonly (
    | string
    | Readonly<{
        name: string | readonly string[];
        message?: string;
      }>
  )[];

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description disallow synchronous methods
 * @link https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-sync.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | false      |
 *  ```
 */
namespace NoSync {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "allowAtRootLevel": {
   *         "type": "boolean",
   *         "default": false
   *       },
   *       "ignores": {
   *         "type": "array",
   *         "items": {
   *           "oneOf": [
   *             {
   *               "type": "string"
   *             },
   *             {
   *               "type": "object",
   *               "properties": {
   *                 "from": {
   *                   "const": "file"
   *                 },
   *                 "path": {
   *                   "type": "string"
   *                 },
   *                 "name": {
   *                   "type": "array",
   *                   "items": {
   *                     "type": "string"
   *                   }
   *                 }
   *               },
   *               "additionalProperties": false
   *             },
   *             {
   *               "type": "object",
   *               "properties": {
   *                 "from": {
   *                   "const": "lib"
   *                 },
   *                 "name": {
   *                   "type": "array",
   *                   "items": {
   *                     "type": "string"
   *                   }
   *                 }
   *               },
   *               "additionalProperties": false
   *             },
   *             {
   *               "type": "object",
   *               "properties": {
   *                 "from": {
   *                   "const": "package"
   *                 },
   *                 "package": {
   *                   "type": "string"
   *                 },
   *                 "name": {
   *                   "type": "array",
   *                   "items": {
   *                     "type": "string"
   *                   }
   *                 }
   *               },
   *               "additionalProperties": false
   *             }
   *           ]
   *         },
   *         "default": []
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    /**
     * @default false
     */
    allowAtRootLevel?: boolean;
    /**
     * @default []
     */
    ignores?: readonly (
      | string
      | Readonly<
          | {
              from?: 'file';
              path?: string;
              name?: readonly string[];
            }
          | {
              from?: 'lib';
              name?: readonly string[];
            }
          | {
              from?: 'package';
              package?: string;
              name?: readonly string[];
            }
        >
    )[];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description disallow top-level `await` in published modules
 * @link https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-top-level-await.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | false   |
 *  | recommended | false   |
 *  ```
 */
namespace NoTopLevelAwait {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "ignoreBin": {
   *         "type": "boolean"
   *       },
   *       "convertPath": {
   *         "anyOf": [
   *           {
   *             "type": "object",
   *             "properties": {},
   *             "patternProperties": {
   *               "^.+$": {
   *                 "type": "array",
   *                 "items": {
   *                   "type": "string"
   *                 },
   *                 "minItems": 2,
   *                 "maxItems": 2
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           {
   *             "type": "array",
   *             "items": {
   *               "type": "object",
   *               "properties": {
   *                 "include": {
   *                   "type": "array",
   *                   "items": {
   *                     "type": "string"
   *                   },
   *                   "minItems": 1,
   *                   "uniqueItems": true
   *                 },
   *                 "exclude": {
   *                   "type": "array",
   *                   "items": {
   *                     "type": "string"
   *                   },
   *                   "uniqueItems": true
   *                 },
   *                 "replace": {
   *                   "type": "array",
   *                   "items": {
   *                     "type": "string"
   *                   },
   *                   "minItems": 2,
   *                   "maxItems": 2
   *                 }
   *               },
   *               "additionalProperties": false,
   *               "required": [
   *                 "include",
   *                 "replace"
   *               ]
   *             },
   *             "minItems": 1
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
    ignoreBin?: boolean;
    convertPath?:
      | Readonly<Record<string, readonly [string, string]>>
      | readonly [
          Readonly<{
            /**
             * @minItems 1
             */
            include: readonly [string, ...string[]];
            exclude?: readonly string[];
            /**
             * @minItems 2
             * @maxItems 2
             */
            replace: readonly [string, string];
          }>,
          ...Readonly<{
            /**
             * @minItems 1
             */
            include: readonly [string, ...string[]];
            exclude?: readonly string[];
            /**
             * @minItems 2
             * @maxItems 2
             */
            replace: readonly [string, string];
          }>[],
        ];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description disallow `bin` files that npm ignores
 * @link https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-unpublished-bin.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | false   |
 *  | recommended | true    |
 *  ```
 */
namespace NoUnpublishedBin {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "convertPath": {
   *         "anyOf": [
   *           {
   *             "type": "object",
   *             "properties": {},
   *             "patternProperties": {
   *               "^.+$": {
   *                 "type": "array",
   *                 "items": {
   *                   "type": "string"
   *                 },
   *                 "minItems": 2,
   *                 "maxItems": 2
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           {
   *             "type": "array",
   *             "items": {
   *               "type": "object",
   *               "properties": {
   *                 "include": {
   *                   "type": "array",
   *                   "items": {
   *                     "type": "string"
   *                   },
   *                   "minItems": 1,
   *                   "uniqueItems": true
   *                 },
   *                 "exclude": {
   *                   "type": "array",
   *                   "items": {
   *                     "type": "string"
   *                   },
   *                   "uniqueItems": true
   *                 },
   *                 "replace": {
   *                   "type": "array",
   *                   "items": {
   *                     "type": "string"
   *                   },
   *                   "minItems": 2,
   *                   "maxItems": 2
   *                 }
   *               },
   *               "additionalProperties": false,
   *               "required": [
   *                 "include",
   *                 "replace"
   *               ]
   *             },
   *             "minItems": 1
   *           }
   *         ]
   *       }
   *     }
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    convertPath?:
      | Readonly<Record<string, readonly [string, string]>>
      | readonly [
          Readonly<{
            /**
             * @minItems 1
             */
            include: readonly [string, ...string[]];
            exclude?: readonly string[];
            /**
             * @minItems 2
             * @maxItems 2
             */
            replace: readonly [string, string];
          }>,
          ...Readonly<{
            /**
             * @minItems 1
             */
            include: readonly [string, ...string[]];
            exclude?: readonly string[];
            /**
             * @minItems 2
             * @maxItems 2
             */
            replace: readonly [string, string];
          }>[],
        ];
    [k: string]: unknown;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description disallow `import` declarations which import private modules
 * @link https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-unpublished-import.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | false   |
 *  | recommended | true    |
 *  ```
 */
namespace NoUnpublishedImport {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "allowModules": {
   *         "type": "array",
   *         "items": {
   *           "type": "string",
   *           "pattern": "^(?:virtual:)?(?:@[a-zA-Z0-9_\\-.]+/)?[a-zA-Z0-9_\\-.]+$"
   *         },
   *         "uniqueItems": true
   *       },
   *       "convertPath": {
   *         "anyOf": [
   *           {
   *             "type": "object",
   *             "properties": {},
   *             "patternProperties": {
   *               "^.+$": {
   *                 "type": "array",
   *                 "items": {
   *                   "type": "string"
   *                 },
   *                 "minItems": 2,
   *                 "maxItems": 2
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           {
   *             "type": "array",
   *             "items": {
   *               "type": "object",
   *               "properties": {
   *                 "include": {
   *                   "type": "array",
   *                   "items": {
   *                     "type": "string"
   *                   },
   *                   "minItems": 1,
   *                   "uniqueItems": true
   *                 },
   *                 "exclude": {
   *                   "type": "array",
   *                   "items": {
   *                     "type": "string"
   *                   },
   *                   "uniqueItems": true
   *                 },
   *                 "replace": {
   *                   "type": "array",
   *                   "items": {
   *                     "type": "string"
   *                   },
   *                   "minItems": 2,
   *                   "maxItems": 2
   *                 }
   *               },
   *               "additionalProperties": false,
   *               "required": [
   *                 "include",
   *                 "replace"
   *               ]
   *             },
   *             "minItems": 1
   *           }
   *         ]
   *       },
   *       "resolvePaths": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         },
   *         "uniqueItems": true
   *       },
   *       "resolverConfig": {
   *         "type": "object",
   *         "properties": {},
   *         "additionalProperties": true
   *       },
   *       "tryExtensions": {
   *         "type": "array",
   *         "items": {
   *           "type": "string",
   *           "pattern": "^\\."
   *         },
   *         "uniqueItems": true
   *       },
   *       "ignoreTypeImport": {
   *         "type": "boolean",
   *         "default": false
   *       },
   *       "ignorePrivate": {
   *         "type": "boolean",
   *         "default": true
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    allowModules?: readonly string[];
    convertPath?:
      | Readonly<Record<string, readonly [string, string]>>
      | readonly [
          Readonly<{
            /**
             * @minItems 1
             */
            include: readonly [string, ...string[]];
            exclude?: readonly string[];
            /**
             * @minItems 2
             * @maxItems 2
             */
            replace: readonly [string, string];
          }>,
          ...Readonly<{
            /**
             * @minItems 1
             */
            include: readonly [string, ...string[]];
            exclude?: readonly string[];
            /**
             * @minItems 2
             * @maxItems 2
             */
            replace: readonly [string, string];
          }>[],
        ];
    resolvePaths?: readonly string[];
    resolverConfig?: UnknownRecord;
    tryExtensions?: readonly string[];
    /**
     * @default false
     */
    ignoreTypeImport?: boolean;
    /**
     * @default true
     */
    ignorePrivate?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description disallow `require()` expressions which import private modules
 * @link https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-unpublished-require.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | false   |
 *  | recommended | true    |
 *  ```
 */
namespace NoUnpublishedRequire {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "allowModules": {
   *         "type": "array",
   *         "items": {
   *           "type": "string",
   *           "pattern": "^(?:virtual:)?(?:@[a-zA-Z0-9_\\-.]+/)?[a-zA-Z0-9_\\-.]+$"
   *         },
   *         "uniqueItems": true
   *       },
   *       "convertPath": {
   *         "anyOf": [
   *           {
   *             "type": "object",
   *             "properties": {},
   *             "patternProperties": {
   *               "^.+$": {
   *                 "type": "array",
   *                 "items": {
   *                   "type": "string"
   *                 },
   *                 "minItems": 2,
   *                 "maxItems": 2
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           {
   *             "type": "array",
   *             "items": {
   *               "type": "object",
   *               "properties": {
   *                 "include": {
   *                   "type": "array",
   *                   "items": {
   *                     "type": "string"
   *                   },
   *                   "minItems": 1,
   *                   "uniqueItems": true
   *                 },
   *                 "exclude": {
   *                   "type": "array",
   *                   "items": {
   *                     "type": "string"
   *                   },
   *                   "uniqueItems": true
   *                 },
   *                 "replace": {
   *                   "type": "array",
   *                   "items": {
   *                     "type": "string"
   *                   },
   *                   "minItems": 2,
   *                   "maxItems": 2
   *                 }
   *               },
   *               "additionalProperties": false,
   *               "required": [
   *                 "include",
   *                 "replace"
   *               ]
   *             },
   *             "minItems": 1
   *           }
   *         ]
   *       },
   *       "resolvePaths": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         },
   *         "uniqueItems": true
   *       },
   *       "resolverConfig": {
   *         "type": "object",
   *         "properties": {},
   *         "additionalProperties": true
   *       },
   *       "tryExtensions": {
   *         "type": "array",
   *         "items": {
   *           "type": "string",
   *           "pattern": "^\\."
   *         },
   *         "uniqueItems": true
   *       },
   *       "ignorePrivate": {
   *         "type": "boolean",
   *         "default": true
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    allowModules?: readonly string[];
    convertPath?:
      | Readonly<Record<string, readonly [string, string]>>
      | readonly [
          Readonly<{
            /**
             * @minItems 1
             */
            include: readonly [string, ...string[]];
            exclude?: readonly string[];
            /**
             * @minItems 2
             * @maxItems 2
             */
            replace: readonly [string, string];
          }>,
          ...Readonly<{
            /**
             * @minItems 1
             */
            include: readonly [string, ...string[]];
            exclude?: readonly string[];
            /**
             * @minItems 2
             * @maxItems 2
             */
            replace: readonly [string, string];
          }>[],
        ];
    resolvePaths?: readonly string[];
    resolverConfig?: UnknownRecord;
    tryExtensions?: readonly string[];
    /**
     * @default true
     */
    ignorePrivate?: boolean;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description disallow unsupported ECMAScript built-ins on the specified version
 * @link https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-unsupported-features/es-builtins.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | false   |
 *  | recommended | true    |
 *  ```
 */
namespace NoUnsupportedFeaturesEsBuiltins {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "version": {
   *         "type": "string"
   *       },
   *       "ignores": {
   *         "type": "array",
   *         "items": {
   *           "enum": [
   *             "AggregateError",
   *             "Array",
   *             "Array.from",
   *             "Array.isArray",
   *             "Array.length",
   *             "Array.of",
   *             "Array.toLocaleString",
   *             "ArrayBuffer",
   *             "ArrayBuffer.isView",
   *             "Atomics",
   *             "Atomics.add",
   *             "Atomics.and",
   *             "Atomics.compareExchange",
   *             "Atomics.exchange",
   *             "Atomics.isLockFree",
   *             "Atomics.load",
   *             "Atomics.notify",
   *             "Atomics.or",
   *             "Atomics.store",
   *             "Atomics.sub",
   *             "Atomics.wait",
   *             "Atomics.waitAsync",
   *             "Atomics.xor",
   *             "BigInt",
   *             "BigInt.asIntN",
   *             "BigInt.asUintN",
   *             "BigInt64Array",
   *             "BigInt64Array.BYTES_PER_ELEMENT",
   *             "BigInt64Array.from",
   *             "BigInt64Array.name",
   *             "BigInt64Array.of",
   *             "BigUint64Array",
   *             "BigUint64Array.BYTES_PER_ELEMENT",
   *             "BigUint64Array.from",
   *             "BigUint64Array.name",
   *             "BigUint64Array.of",
   *             "Boolean",
   *             "DataView",
   *             "Date",
   *             "Date.UTC",
   *             "Date.now",
   *             "Date.parse",
   *             "Date.toLocaleDateString",
   *             "Date.toLocaleString",
   *             "Date.toLocaleTimeString",
   *             "Error",
   *             "Error.cause",
   *             "EvalError",
   *             "FinalizationRegistry",
   *             "Float32Array",
   *             "Float32Array.BYTES_PER_ELEMENT",
   *             "Float32Array.from",
   *             "Float32Array.name",
   *             "Float32Array.of",
   *             "Float64Array",
   *             "Float64Array.BYTES_PER_ELEMENT",
   *             "Float64Array.from",
   *             "Float64Array.name",
   *             "Float64Array.of",
   *             "Function",
   *             "Function.length",
   *             "Function.name",
   *             "Infinity",
   *             "Int16Array",
   *             "Int16Array.BYTES_PER_ELEMENT",
   *             "Int16Array.from",
   *             "Int16Array.name",
   *             "Int16Array.of",
   *             "Int32Array",
   *             "Int32Array.BYTES_PER_ELEMENT",
   *             "Int32Array.from",
   *             "Int32Array.name",
   *             "Int32Array.of",
   *             "Int8Array",
   *             "Int8Array.BYTES_PER_ELEMENT",
   *             "Int8Array.from",
   *             "Int8Array.name",
   *             "Int8Array.of",
   *             "Intl",
   *             "Intl.Collator",
   *             "Intl.DateTimeFormat",
   *             "Intl.DisplayNames",
   *             "Intl.ListFormat",
   *             "Intl.Locale",
   *             "Intl.NumberFormat",
   *             "Intl.PluralRules",
   *             "Intl.RelativeTimeFormat",
   *             "Intl.Segmenter",
   *             "Intl.Segments",
   *             "Intl.getCanonicalLocales",
   *             "Intl.supportedValuesOf",
   *             "JSON",
   *             "JSON.parse",
   *             "JSON.stringify",
   *             "Map",
   *             "Map.groupBy",
   *             "Math",
   *             "Math.E",
   *             "Math.LN10",
   *             "Math.LN2",
   *             "Math.LOG10E",
   *             "Math.LOG2E",
   *             "Math.PI",
   *             "Math.SQRT1_2",
   *             "Math.SQRT2",
   *             "Math.abs",
   *             "Math.acos",
   *             "Math.acosh",
   *             "Math.asin",
   *             "Math.asinh",
   *             "Math.atan",
   *             "Math.atan2",
   *             "Math.atanh",
   *             "Math.cbrt",
   *             "Math.ceil",
   *             "Math.clz32",
   *             "Math.cos",
   *             "Math.cosh",
   *             "Math.exp",
   *             "Math.expm1",
   *             "Math.floor",
   *             "Math.fround",
   *             "Math.hypot",
   *             "Math.imul",
   *             "Math.log",
   *             "Math.log10",
   *             "Math.log1p",
   *             "Math.log2",
   *             "Math.max",
   *             "Math.min",
   *             "Math.pow",
   *             "Math.random",
   *             "Math.round",
   *             "Math.sign",
   *             "Math.sin",
   *             "Math.sinh",
   *             "Math.sqrt",
   *             "Math.tan",
   *             "Math.tanh",
   *             "Math.trunc",
   *             "NaN",
   *             "Number.EPSILON",
   *             "Number.MAX_SAFE_INTEGER",
   *             "Number.MAX_VALUE",
   *             "Number.MIN_SAFE_INTEGER",
   *             "Number.MIN_VALUE",
   *             "Number.NEGATIVE_INFINITY",
   *             "Number.NaN",
   *             "Number.POSITIVE_INFINITY",
   *             "Number.isFinite",
   *             "Number.isInteger",
   *             "Number.isNaN",
   *             "Number.isSafeInteger",
   *             "Number.parseFloat",
   *             "Number.parseInt",
   *             "Number.toLocaleString",
   *             "Object.assign",
   *             "Object.create",
   *             "Object.defineGetter",
   *             "Object.defineProperties",
   *             "Object.defineProperty",
   *             "Object.defineSetter",
   *             "Object.entries",
   *             "Object.freeze",
   *             "Object.fromEntries",
   *             "Object.getOwnPropertyDescriptor",
   *             "Object.getOwnPropertyDescriptors",
   *             "Object.getOwnPropertyNames",
   *             "Object.getOwnPropertySymbols",
   *             "Object.getPrototypeOf",
   *             "Object.groupBy",
   *             "Object.hasOwn",
   *             "Object.is",
   *             "Object.isExtensible",
   *             "Object.isFrozen",
   *             "Object.isSealed",
   *             "Object.keys",
   *             "Object.lookupGetter",
   *             "Object.lookupSetter",
   *             "Object.preventExtensions",
   *             "Object.proto",
   *             "Object.seal",
   *             "Object.setPrototypeOf",
   *             "Object.values",
   *             "Promise",
   *             "Promise.all",
   *             "Promise.allSettled",
   *             "Promise.any",
   *             "Promise.race",
   *             "Promise.reject",
   *             "Promise.resolve",
   *             "Proxy",
   *             "Proxy.revocable",
   *             "RangeError",
   *             "ReferenceError",
   *             "Reflect",
   *             "Reflect.apply",
   *             "Reflect.construct",
   *             "Reflect.defineProperty",
   *             "Reflect.deleteProperty",
   *             "Reflect.get",
   *             "Reflect.getOwnPropertyDescriptor",
   *             "Reflect.getPrototypeOf",
   *             "Reflect.has",
   *             "Reflect.isExtensible",
   *             "Reflect.ownKeys",
   *             "Reflect.preventExtensions",
   *             "Reflect.set",
   *             "Reflect.setPrototypeOf",
   *             "RegExp",
   *             "RegExp.dotAll",
   *             "RegExp.hasIndices",
   *             "RegExp.input",
   *             "RegExp.lastIndex",
   *             "RegExp.lastMatch",
   *             "RegExp.lastParen",
   *             "RegExp.leftContext",
   *             "RegExp.n",
   *             "RegExp.rightContext",
   *             "Set",
   *             "SharedArrayBuffer",
   *             "String",
   *             "String.fromCharCode",
   *             "String.fromCodePoint",
   *             "String.length",
   *             "String.localeCompare",
   *             "String.raw",
   *             "String.toLocaleLowerCase",
   *             "String.toLocaleUpperCase",
   *             "Symbol",
   *             "Symbol.asyncIterator",
   *             "Symbol.for",
   *             "Symbol.hasInstance",
   *             "Symbol.isConcatSpreadable",
   *             "Symbol.iterator",
   *             "Symbol.keyFor",
   *             "Symbol.match",
   *             "Symbol.matchAll",
   *             "Symbol.replace",
   *             "Symbol.search",
   *             "Symbol.species",
   *             "Symbol.split",
   *             "Symbol.toPrimitive",
   *             "Symbol.toStringTag",
   *             "Symbol.unscopables",
   *             "SyntaxError",
   *             "TypeError",
   *             "URIError",
   *             "Uint16Array",
   *             "Uint16Array.BYTES_PER_ELEMENT",
   *             "Uint16Array.from",
   *             "Uint16Array.name",
   *             "Uint16Array.of",
   *             "Uint32Array",
   *             "Uint32Array.BYTES_PER_ELEMENT",
   *             "Uint32Array.from",
   *             "Uint32Array.name",
   *             "Uint32Array.of",
   *             "Uint8Array",
   *             "Uint8Array.BYTES_PER_ELEMENT",
   *             "Uint8Array.from",
   *             "Uint8Array.name",
   *             "Uint8Array.of",
   *             "Uint8ClampedArray",
   *             "Uint8ClampedArray.BYTES_PER_ELEMENT",
   *             "Uint8ClampedArray.from",
   *             "Uint8ClampedArray.name",
   *             "Uint8ClampedArray.of",
   *             "WeakMap",
   *             "WeakRef",
   *             "WeakSet",
   *             "decodeURI",
   *             "decodeURIComponent",
   *             "encodeURI",
   *             "encodeURIComponent",
   *             "escape",
   *             "eval",
   *             "globalThis",
   *             "isFinite",
   *             "isNaN",
   *             "parseFloat",
   *             "parseInt",
   *             "unescape"
   *           ]
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
    version?: string;
    ignores?: readonly (
      | 'AggregateError'
      | 'Array'
      | 'Array.from'
      | 'Array.isArray'
      | 'Array.length'
      | 'Array.of'
      | 'Array.toLocaleString'
      | 'ArrayBuffer'
      | 'ArrayBuffer.isView'
      | 'Atomics'
      | 'Atomics.add'
      | 'Atomics.and'
      | 'Atomics.compareExchange'
      | 'Atomics.exchange'
      | 'Atomics.isLockFree'
      | 'Atomics.load'
      | 'Atomics.notify'
      | 'Atomics.or'
      | 'Atomics.store'
      | 'Atomics.sub'
      | 'Atomics.wait'
      | 'Atomics.waitAsync'
      | 'Atomics.xor'
      | 'BigInt'
      | 'BigInt.asIntN'
      | 'BigInt.asUintN'
      | 'BigInt64Array'
      | 'BigInt64Array.BYTES_PER_ELEMENT'
      | 'BigInt64Array.from'
      | 'BigInt64Array.name'
      | 'BigInt64Array.of'
      | 'BigUint64Array'
      | 'BigUint64Array.BYTES_PER_ELEMENT'
      | 'BigUint64Array.from'
      | 'BigUint64Array.name'
      | 'BigUint64Array.of'
      | 'Boolean'
      | 'DataView'
      | 'Date'
      | 'Date.UTC'
      | 'Date.now'
      | 'Date.parse'
      | 'Date.toLocaleDateString'
      | 'Date.toLocaleString'
      | 'Date.toLocaleTimeString'
      | 'Error'
      | 'Error.cause'
      | 'EvalError'
      | 'FinalizationRegistry'
      | 'Float32Array'
      | 'Float32Array.BYTES_PER_ELEMENT'
      | 'Float32Array.from'
      | 'Float32Array.name'
      | 'Float32Array.of'
      | 'Float64Array'
      | 'Float64Array.BYTES_PER_ELEMENT'
      | 'Float64Array.from'
      | 'Float64Array.name'
      | 'Float64Array.of'
      | 'Function'
      | 'Function.length'
      | 'Function.name'
      | 'Infinity'
      | 'Int16Array'
      | 'Int16Array.BYTES_PER_ELEMENT'
      | 'Int16Array.from'
      | 'Int16Array.name'
      | 'Int16Array.of'
      | 'Int32Array'
      | 'Int32Array.BYTES_PER_ELEMENT'
      | 'Int32Array.from'
      | 'Int32Array.name'
      | 'Int32Array.of'
      | 'Int8Array'
      | 'Int8Array.BYTES_PER_ELEMENT'
      | 'Int8Array.from'
      | 'Int8Array.name'
      | 'Int8Array.of'
      | 'Intl'
      | 'Intl.Collator'
      | 'Intl.DateTimeFormat'
      | 'Intl.DisplayNames'
      | 'Intl.ListFormat'
      | 'Intl.Locale'
      | 'Intl.NumberFormat'
      | 'Intl.PluralRules'
      | 'Intl.RelativeTimeFormat'
      | 'Intl.Segmenter'
      | 'Intl.Segments'
      | 'Intl.getCanonicalLocales'
      | 'Intl.supportedValuesOf'
      | 'JSON'
      | 'JSON.parse'
      | 'JSON.stringify'
      | 'Map'
      | 'Map.groupBy'
      | 'Math'
      | 'Math.E'
      | 'Math.LN10'
      | 'Math.LN2'
      | 'Math.LOG10E'
      | 'Math.LOG2E'
      | 'Math.PI'
      | 'Math.SQRT1_2'
      | 'Math.SQRT2'
      | 'Math.abs'
      | 'Math.acos'
      | 'Math.acosh'
      | 'Math.asin'
      | 'Math.asinh'
      | 'Math.atan'
      | 'Math.atan2'
      | 'Math.atanh'
      | 'Math.cbrt'
      | 'Math.ceil'
      | 'Math.clz32'
      | 'Math.cos'
      | 'Math.cosh'
      | 'Math.exp'
      | 'Math.expm1'
      | 'Math.floor'
      | 'Math.fround'
      | 'Math.hypot'
      | 'Math.imul'
      | 'Math.log'
      | 'Math.log10'
      | 'Math.log1p'
      | 'Math.log2'
      | 'Math.max'
      | 'Math.min'
      | 'Math.pow'
      | 'Math.random'
      | 'Math.round'
      | 'Math.sign'
      | 'Math.sin'
      | 'Math.sinh'
      | 'Math.sqrt'
      | 'Math.tan'
      | 'Math.tanh'
      | 'Math.trunc'
      | 'NaN'
      | 'Number.EPSILON'
      | 'Number.MAX_SAFE_INTEGER'
      | 'Number.MAX_VALUE'
      | 'Number.MIN_SAFE_INTEGER'
      | 'Number.MIN_VALUE'
      | 'Number.NEGATIVE_INFINITY'
      | 'Number.NaN'
      | 'Number.POSITIVE_INFINITY'
      | 'Number.isFinite'
      | 'Number.isInteger'
      | 'Number.isNaN'
      | 'Number.isSafeInteger'
      | 'Number.parseFloat'
      | 'Number.parseInt'
      | 'Number.toLocaleString'
      | 'Object.assign'
      | 'Object.create'
      | 'Object.defineGetter'
      | 'Object.defineProperties'
      | 'Object.defineProperty'
      | 'Object.defineSetter'
      | 'Object.entries'
      | 'Object.freeze'
      | 'Object.fromEntries'
      | 'Object.getOwnPropertyDescriptor'
      | 'Object.getOwnPropertyDescriptors'
      | 'Object.getOwnPropertyNames'
      | 'Object.getOwnPropertySymbols'
      | 'Object.getPrototypeOf'
      | 'Object.groupBy'
      | 'Object.hasOwn'
      | 'Object.is'
      | 'Object.isExtensible'
      | 'Object.isFrozen'
      | 'Object.isSealed'
      | 'Object.keys'
      | 'Object.lookupGetter'
      | 'Object.lookupSetter'
      | 'Object.preventExtensions'
      | 'Object.proto'
      | 'Object.seal'
      | 'Object.setPrototypeOf'
      | 'Object.values'
      | 'Promise'
      | 'Promise.all'
      | 'Promise.allSettled'
      | 'Promise.any'
      | 'Promise.race'
      | 'Promise.reject'
      | 'Promise.resolve'
      | 'Proxy'
      | 'Proxy.revocable'
      | 'RangeError'
      | 'ReferenceError'
      | 'Reflect'
      | 'Reflect.apply'
      | 'Reflect.construct'
      | 'Reflect.defineProperty'
      | 'Reflect.deleteProperty'
      | 'Reflect.get'
      | 'Reflect.getOwnPropertyDescriptor'
      | 'Reflect.getPrototypeOf'
      | 'Reflect.has'
      | 'Reflect.isExtensible'
      | 'Reflect.ownKeys'
      | 'Reflect.preventExtensions'
      | 'Reflect.set'
      | 'Reflect.setPrototypeOf'
      | 'RegExp'
      | 'RegExp.dotAll'
      | 'RegExp.hasIndices'
      | 'RegExp.input'
      | 'RegExp.lastIndex'
      | 'RegExp.lastMatch'
      | 'RegExp.lastParen'
      | 'RegExp.leftContext'
      | 'RegExp.n'
      | 'RegExp.rightContext'
      | 'Set'
      | 'SharedArrayBuffer'
      | 'String'
      | 'String.fromCharCode'
      | 'String.fromCodePoint'
      | 'String.length'
      | 'String.localeCompare'
      | 'String.raw'
      | 'String.toLocaleLowerCase'
      | 'String.toLocaleUpperCase'
      | 'Symbol'
      | 'Symbol.asyncIterator'
      | 'Symbol.for'
      | 'Symbol.hasInstance'
      | 'Symbol.isConcatSpreadable'
      | 'Symbol.iterator'
      | 'Symbol.keyFor'
      | 'Symbol.match'
      | 'Symbol.matchAll'
      | 'Symbol.replace'
      | 'Symbol.search'
      | 'Symbol.species'
      | 'Symbol.split'
      | 'Symbol.toPrimitive'
      | 'Symbol.toStringTag'
      | 'Symbol.unscopables'
      | 'SyntaxError'
      | 'TypeError'
      | 'URIError'
      | 'Uint16Array'
      | 'Uint16Array.BYTES_PER_ELEMENT'
      | 'Uint16Array.from'
      | 'Uint16Array.name'
      | 'Uint16Array.of'
      | 'Uint32Array'
      | 'Uint32Array.BYTES_PER_ELEMENT'
      | 'Uint32Array.from'
      | 'Uint32Array.name'
      | 'Uint32Array.of'
      | 'Uint8Array'
      | 'Uint8Array.BYTES_PER_ELEMENT'
      | 'Uint8Array.from'
      | 'Uint8Array.name'
      | 'Uint8Array.of'
      | 'Uint8ClampedArray'
      | 'Uint8ClampedArray.BYTES_PER_ELEMENT'
      | 'Uint8ClampedArray.from'
      | 'Uint8ClampedArray.name'
      | 'Uint8ClampedArray.of'
      | 'WeakMap'
      | 'WeakRef'
      | 'WeakSet'
      | 'decodeURI'
      | 'decodeURIComponent'
      | 'encodeURI'
      | 'encodeURIComponent'
      | 'escape'
      | 'eval'
      | 'globalThis'
      | 'isFinite'
      | 'isNaN'
      | 'parseFloat'
      | 'parseInt'
      | 'unescape'
    )[];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description disallow unsupported ECMAScript syntax on the specified version
 * @link https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-unsupported-features/es-syntax.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | false   |
 *  | recommended | true    |
 *  ```
 */
namespace NoUnsupportedFeaturesEsSyntax {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "version": {
   *         "type": "string"
   *       },
   *       "ignores": {
   *         "type": "array",
   *         "items": {
   *           "enum": [
   *             "no-accessor-properties",
   *             "accessor-properties",
   *             "accessorProperties",
   *             "no-arbitrary-module-namespace-names",
   *             "arbitrary-module-namespace-names",
   *             "arbitraryModuleNamespaceNames",
   *             "no-array-from",
   *             "array-from",
   *             "arrayFrom",
   *             "no-array-isarray",
   *             "array-isarray",
   *             "arrayIsarray",
   *             "no-array-of",
   *             "array-of",
   *             "arrayOf",
   *             "no-array-prototype-copywithin",
   *             "array-prototype-copywithin",
   *             "arrayPrototypeCopywithin",
   *             "no-array-prototype-entries",
   *             "array-prototype-entries",
   *             "arrayPrototypeEntries",
   *             "no-array-prototype-every",
   *             "array-prototype-every",
   *             "arrayPrototypeEvery",
   *             "no-array-prototype-fill",
   *             "array-prototype-fill",
   *             "arrayPrototypeFill",
   *             "no-array-prototype-filter",
   *             "array-prototype-filter",
   *             "arrayPrototypeFilter",
   *             "no-array-prototype-find",
   *             "array-prototype-find",
   *             "arrayPrototypeFind",
   *             "no-array-prototype-findindex",
   *             "array-prototype-findindex",
   *             "arrayPrototypeFindindex",
   *             "no-array-prototype-findlast-findlastindex",
   *             "array-prototype-findlast-findlastindex",
   *             "arrayPrototypeFindlastFindlastindex",
   *             "no-array-prototype-flat",
   *             "array-prototype-flat",
   *             "arrayPrototypeFlat",
   *             "no-array-prototype-foreach",
   *             "array-prototype-foreach",
   *             "arrayPrototypeForeach",
   *             "no-array-prototype-includes",
   *             "array-prototype-includes",
   *             "arrayPrototypeIncludes",
   *             "no-array-prototype-indexof",
   *             "array-prototype-indexof",
   *             "arrayPrototypeIndexof",
   *             "no-array-prototype-keys",
   *             "array-prototype-keys",
   *             "arrayPrototypeKeys",
   *             "no-array-prototype-lastindexof",
   *             "array-prototype-lastindexof",
   *             "arrayPrototypeLastindexof",
   *             "no-array-prototype-map",
   *             "array-prototype-map",
   *             "arrayPrototypeMap",
   *             "no-array-prototype-reduce",
   *             "array-prototype-reduce",
   *             "arrayPrototypeReduce",
   *             "no-array-prototype-reduceright",
   *             "array-prototype-reduceright",
   *             "arrayPrototypeReduceright",
   *             "no-array-prototype-some",
   *             "array-prototype-some",
   *             "arrayPrototypeSome",
   *             "no-array-prototype-toreversed",
   *             "array-prototype-toreversed",
   *             "arrayPrototypeToreversed",
   *             "no-array-prototype-tosorted",
   *             "array-prototype-tosorted",
   *             "arrayPrototypeTosorted",
   *             "no-array-prototype-tospliced",
   *             "array-prototype-tospliced",
   *             "arrayPrototypeTospliced",
   *             "no-array-prototype-values",
   *             "array-prototype-values",
   *             "arrayPrototypeValues",
   *             "no-array-prototype-with",
   *             "array-prototype-with",
   *             "arrayPrototypeWith",
   *             "no-array-string-prototype-at",
   *             "array-string-prototype-at",
   *             "arrayStringPrototypeAt",
   *             "no-arrow-functions",
   *             "arrow-functions",
   *             "arrowFunctions",
   *             "no-async-functions",
   *             "async-functions",
   *             "asyncFunctions",
   *             "no-async-iteration",
   *             "async-iteration",
   *             "asyncIteration",
   *             "no-atomics-waitasync",
   *             "atomics-waitasync",
   *             "atomicsWaitasync",
   *             "no-atomics",
   *             "atomics",
   *             "no-bigint",
   *             "bigint",
   *             "no-binary-numeric-literals",
   *             "binary-numeric-literals",
   *             "binaryNumericLiterals",
   *             "no-block-scoped-functions",
   *             "block-scoped-functions",
   *             "blockScopedFunctions",
   *             "no-block-scoped-variables",
   *             "block-scoped-variables",
   *             "blockScopedVariables",
   *             "no-class-fields",
   *             "class-fields",
   *             "classFields",
   *             "no-class-static-block",
   *             "class-static-block",
   *             "classStaticBlock",
   *             "no-classes",
   *             "classes",
   *             "no-computed-properties",
   *             "computed-properties",
   *             "computedProperties",
   *             "no-date-now",
   *             "date-now",
   *             "dateNow",
   *             "no-date-prototype-getyear-setyear",
   *             "date-prototype-getyear-setyear",
   *             "datePrototypeGetyearSetyear",
   *             "no-date-prototype-togmtstring",
   *             "date-prototype-togmtstring",
   *             "datePrototypeTogmtstring",
   *             "no-default-parameters",
   *             "default-parameters",
   *             "defaultParameters",
   *             "no-destructuring",
   *             "destructuring",
   *             "no-dynamic-import",
   *             "dynamic-import",
   *             "dynamicImport",
   *             "no-error-cause",
   *             "error-cause",
   *             "errorCause",
   *             "no-escape-unescape",
   *             "escape-unescape",
   *             "escapeUnescape",
   *             "no-exponential-operators",
   *             "exponential-operators",
   *             "exponentialOperators",
   *             "no-export-ns-from",
   *             "export-ns-from",
   *             "exportNsFrom",
   *             "no-for-of-loops",
   *             "for-of-loops",
   *             "forOfLoops",
   *             "no-function-declarations-in-if-statement-clauses-without-block",
   *             "function-declarations-in-if-statement-clauses-without-block",
   *             "functionDeclarationsInIfStatementClausesWithoutBlock",
   *             "no-function-prototype-bind",
   *             "function-prototype-bind",
   *             "functionPrototypeBind",
   *             "no-generators",
   *             "generators",
   *             "no-global-this",
   *             "global-this",
   *             "globalThis",
   *             "no-hashbang",
   *             "hashbang",
   *             "no-import-meta",
   *             "import-meta",
   *             "importMeta",
   *             "no-initializers-in-for-in",
   *             "initializers-in-for-in",
   *             "initializersInForIn",
   *             "no-intl-datetimeformat-prototype-formatrange",
   *             "intl-datetimeformat-prototype-formatrange",
   *             "intlDatetimeformatPrototypeFormatrange",
   *             "no-intl-datetimeformat-prototype-formattoparts",
   *             "intl-datetimeformat-prototype-formattoparts",
   *             "intlDatetimeformatPrototypeFormattoparts",
   *             "no-intl-displaynames",
   *             "intl-displaynames",
   *             "intlDisplaynames",
   *             "no-intl-getcanonicallocales",
   *             "intl-getcanonicallocales",
   *             "intlGetcanonicallocales",
   *             "no-intl-listformat",
   *             "intl-listformat",
   *             "intlListformat",
   *             "no-intl-locale",
   *             "intl-locale",
   *             "intlLocale",
   *             "no-intl-numberformat-prototype-formatrange",
   *             "intl-numberformat-prototype-formatrange",
   *             "intlNumberformatPrototypeFormatrange",
   *             "no-intl-numberformat-prototype-formatrangetoparts",
   *             "intl-numberformat-prototype-formatrangetoparts",
   *             "intlNumberformatPrototypeFormatrangetoparts",
   *             "no-intl-numberformat-prototype-formattoparts",
   *             "intl-numberformat-prototype-formattoparts",
   *             "intlNumberformatPrototypeFormattoparts",
   *             "no-intl-pluralrules-prototype-selectrange",
   *             "intl-pluralrules-prototype-selectrange",
   *             "intlPluralrulesPrototypeSelectrange",
   *             "no-intl-pluralrules",
   *             "intl-pluralrules",
   *             "intlPluralrules",
   *             "no-intl-relativetimeformat",
   *             "intl-relativetimeformat",
   *             "intlRelativetimeformat",
   *             "no-intl-segmenter",
   *             "intl-segmenter",
   *             "intlSegmenter",
   *             "no-intl-supportedvaluesof",
   *             "intl-supportedvaluesof",
   *             "intlSupportedvaluesof",
   *             "no-json-superset",
   *             "json-superset",
   *             "jsonSuperset",
   *             "no-json",
   *             "json",
   *             "no-keyword-properties",
   *             "keyword-properties",
   *             "keywordProperties",
   *             "no-labelled-function-declarations",
   *             "labelled-function-declarations",
   *             "labelledFunctionDeclarations",
   *             "no-legacy-object-prototype-accessor-methods",
   *             "legacy-object-prototype-accessor-methods",
   *             "legacyObjectPrototypeAccessorMethods",
   *             "no-logical-assignment-operators",
   *             "logical-assignment-operators",
   *             "logicalAssignmentOperators",
   *             "no-malformed-template-literals",
   *             "malformed-template-literals",
   *             "malformedTemplateLiterals",
   *             "no-map",
   *             "map",
   *             "no-math-acosh",
   *             "math-acosh",
   *             "mathAcosh",
   *             "no-math-asinh",
   *             "math-asinh",
   *             "mathAsinh",
   *             "no-math-atanh",
   *             "math-atanh",
   *             "mathAtanh",
   *             "no-math-cbrt",
   *             "math-cbrt",
   *             "mathCbrt",
   *             "no-math-clz32",
   *             "math-clz32",
   *             "mathClz32",
   *             "no-math-cosh",
   *             "math-cosh",
   *             "mathCosh",
   *             "no-math-expm1",
   *             "math-expm1",
   *             "mathExpm1",
   *             "no-math-fround",
   *             "math-fround",
   *             "mathFround",
   *             "no-math-hypot",
   *             "math-hypot",
   *             "mathHypot",
   *             "no-math-imul",
   *             "math-imul",
   *             "mathImul",
   *             "no-math-log10",
   *             "math-log10",
   *             "mathLog10",
   *             "no-math-log1p",
   *             "math-log1p",
   *             "mathLog1p",
   *             "no-math-log2",
   *             "math-log2",
   *             "mathLog2",
   *             "no-math-sign",
   *             "math-sign",
   *             "mathSign",
   *             "no-math-sinh",
   *             "math-sinh",
   *             "mathSinh",
   *             "no-math-tanh",
   *             "math-tanh",
   *             "mathTanh",
   *             "no-math-trunc",
   *             "math-trunc",
   *             "mathTrunc",
   *             "no-modules",
   *             "modules",
   *             "no-new-target",
   *             "new-target",
   *             "newTarget",
   *             "new.target",
   *             "no-nullish-coalescing-operators",
   *             "nullish-coalescing-operators",
   *             "nullishCoalescingOperators",
   *             "no-number-epsilon",
   *             "number-epsilon",
   *             "numberEpsilon",
   *             "no-number-isfinite",
   *             "number-isfinite",
   *             "numberIsfinite",
   *             "no-number-isinteger",
   *             "number-isinteger",
   *             "numberIsinteger",
   *             "no-number-isnan",
   *             "number-isnan",
   *             "numberIsnan",
   *             "no-number-issafeinteger",
   *             "number-issafeinteger",
   *             "numberIssafeinteger",
   *             "no-number-maxsafeinteger",
   *             "number-maxsafeinteger",
   *             "numberMaxsafeinteger",
   *             "no-number-minsafeinteger",
   *             "number-minsafeinteger",
   *             "numberMinsafeinteger",
   *             "no-number-parsefloat",
   *             "number-parsefloat",
   *             "numberParsefloat",
   *             "no-number-parseint",
   *             "number-parseint",
   *             "numberParseint",
   *             "no-numeric-separators",
   *             "numeric-separators",
   *             "numericSeparators",
   *             "no-object-assign",
   *             "object-assign",
   *             "objectAssign",
   *             "no-object-create",
   *             "object-create",
   *             "objectCreate",
   *             "no-object-defineproperties",
   *             "object-defineproperties",
   *             "objectDefineproperties",
   *             "no-object-defineproperty",
   *             "object-defineproperty",
   *             "objectDefineproperty",
   *             "no-object-entries",
   *             "object-entries",
   *             "objectEntries",
   *             "no-object-freeze",
   *             "object-freeze",
   *             "objectFreeze",
   *             "no-object-fromentries",
   *             "object-fromentries",
   *             "objectFromentries",
   *             "no-object-getownpropertydescriptor",
   *             "object-getownpropertydescriptor",
   *             "objectGetownpropertydescriptor",
   *             "no-object-getownpropertydescriptors",
   *             "object-getownpropertydescriptors",
   *             "objectGetownpropertydescriptors",
   *             "no-object-getownpropertynames",
   *             "object-getownpropertynames",
   *             "objectGetownpropertynames",
   *             "no-object-getownpropertysymbols",
   *             "object-getownpropertysymbols",
   *             "objectGetownpropertysymbols",
   *             "no-object-getprototypeof",
   *             "object-getprototypeof",
   *             "objectGetprototypeof",
   *             "no-object-hasown",
   *             "object-hasown",
   *             "objectHasown",
   *             "no-object-is",
   *             "object-is",
   *             "objectIs",
   *             "no-object-isextensible",
   *             "object-isextensible",
   *             "objectIsextensible",
   *             "no-object-isfrozen",
   *             "object-isfrozen",
   *             "objectIsfrozen",
   *             "no-object-issealed",
   *             "object-issealed",
   *             "objectIssealed",
   *             "no-object-keys",
   *             "object-keys",
   *             "objectKeys",
   *             "no-object-map-groupby",
   *             "object-map-groupby",
   *             "objectMapGroupby",
   *             "no-object-preventextensions",
   *             "object-preventextensions",
   *             "objectPreventextensions",
   *             "no-object-seal",
   *             "object-seal",
   *             "objectSeal",
   *             "no-object-setprototypeof",
   *             "object-setprototypeof",
   *             "objectSetprototypeof",
   *             "no-object-super-properties",
   *             "object-super-properties",
   *             "objectSuperProperties",
   *             "no-object-values",
   *             "object-values",
   *             "objectValues",
   *             "no-octal-numeric-literals",
   *             "octal-numeric-literals",
   *             "octalNumericLiterals",
   *             "no-optional-catch-binding",
   *             "optional-catch-binding",
   *             "optionalCatchBinding",
   *             "no-optional-chaining",
   *             "optional-chaining",
   *             "optionalChaining",
   *             "no-private-in",
   *             "private-in",
   *             "privateIn",
   *             "no-promise-all-settled",
   *             "promise-all-settled",
   *             "promiseAllSettled",
   *             "no-promise-any",
   *             "promise-any",
   *             "promiseAny",
   *             "no-promise-prototype-finally",
   *             "promise-prototype-finally",
   *             "promisePrototypeFinally",
   *             "no-promise-withresolvers",
   *             "promise-withresolvers",
   *             "promiseWithresolvers",
   *             "no-promise",
   *             "promise",
   *             "no-property-shorthands",
   *             "property-shorthands",
   *             "propertyShorthands",
   *             "no-proxy",
   *             "proxy",
   *             "no-reflect",
   *             "reflect",
   *             "no-regexp-d-flag",
   *             "regexp-d-flag",
   *             "regexpDFlag",
   *             "no-regexp-lookbehind-assertions",
   *             "regexp-lookbehind-assertions",
   *             "regexpLookbehindAssertions",
   *             "regexpLookbehind",
   *             "no-regexp-named-capture-groups",
   *             "regexp-named-capture-groups",
   *             "regexpNamedCaptureGroups",
   *             "no-regexp-prototype-compile",
   *             "regexp-prototype-compile",
   *             "regexpPrototypeCompile",
   *             "no-regexp-prototype-flags",
   *             "regexp-prototype-flags",
   *             "regexpPrototypeFlags",
   *             "no-regexp-s-flag",
   *             "regexp-s-flag",
   *             "regexpSFlag",
   *             "regexpS",
   *             "no-regexp-u-flag",
   *             "regexp-u-flag",
   *             "regexpUFlag",
   *             "regexpU",
   *             "no-regexp-unicode-property-escapes-2019",
   *             "regexp-unicode-property-escapes-2019",
   *             "regexpUnicodePropertyEscapes2019",
   *             "no-regexp-unicode-property-escapes-2020",
   *             "regexp-unicode-property-escapes-2020",
   *             "regexpUnicodePropertyEscapes2020",
   *             "no-regexp-unicode-property-escapes-2021",
   *             "regexp-unicode-property-escapes-2021",
   *             "regexpUnicodePropertyEscapes2021",
   *             "no-regexp-unicode-property-escapes-2022",
   *             "regexp-unicode-property-escapes-2022",
   *             "regexpUnicodePropertyEscapes2022",
   *             "no-regexp-unicode-property-escapes-2023",
   *             "regexp-unicode-property-escapes-2023",
   *             "regexpUnicodePropertyEscapes2023",
   *             "no-regexp-unicode-property-escapes",
   *             "regexp-unicode-property-escapes",
   *             "regexpUnicodePropertyEscapes",
   *             "regexpUnicodeProperties",
   *             "no-regexp-v-flag",
   *             "regexp-v-flag",
   *             "regexpVFlag",
   *             "no-regexp-y-flag",
   *             "regexp-y-flag",
   *             "regexpYFlag",
   *             "regexpY",
   *             "no-resizable-and-growable-arraybuffers",
   *             "resizable-and-growable-arraybuffers",
   *             "resizableAndGrowableArraybuffers",
   *             "no-rest-parameters",
   *             "rest-parameters",
   *             "restParameters",
   *             "no-rest-spread-properties",
   *             "rest-spread-properties",
   *             "restSpreadProperties",
   *             "no-set",
   *             "set",
   *             "no-shadow-catch-param",
   *             "shadow-catch-param",
   *             "shadowCatchParam",
   *             "no-shared-array-buffer",
   *             "shared-array-buffer",
   *             "sharedArrayBuffer",
   *             "no-spread-elements",
   *             "spread-elements",
   *             "spreadElements",
   *             "no-string-create-html-methods",
   *             "string-create-html-methods",
   *             "stringCreateHtmlMethods",
   *             "no-string-fromcodepoint",
   *             "string-fromcodepoint",
   *             "stringFromcodepoint",
   *             "no-string-prototype-codepointat",
   *             "string-prototype-codepointat",
   *             "stringPrototypeCodepointat",
   *             "no-string-prototype-endswith",
   *             "string-prototype-endswith",
   *             "stringPrototypeEndswith",
   *             "no-string-prototype-includes",
   *             "string-prototype-includes",
   *             "stringPrototypeIncludes",
   *             "no-string-prototype-iswellformed-towellformed",
   *             "string-prototype-iswellformed-towellformed",
   *             "stringPrototypeIswellformedTowellformed",
   *             "no-string-prototype-matchall",
   *             "string-prototype-matchall",
   *             "stringPrototypeMatchall",
   *             "no-string-prototype-normalize",
   *             "string-prototype-normalize",
   *             "stringPrototypeNormalize",
   *             "no-string-prototype-padstart-padend",
   *             "string-prototype-padstart-padend",
   *             "stringPrototypePadstartPadend",
   *             "no-string-prototype-repeat",
   *             "string-prototype-repeat",
   *             "stringPrototypeRepeat",
   *             "no-string-prototype-replaceall",
   *             "string-prototype-replaceall",
   *             "stringPrototypeReplaceall",
   *             "no-string-prototype-startswith",
   *             "string-prototype-startswith",
   *             "stringPrototypeStartswith",
   *             "no-string-prototype-substr",
   *             "string-prototype-substr",
   *             "stringPrototypeSubstr",
   *             "no-string-prototype-trim",
   *             "string-prototype-trim",
   *             "stringPrototypeTrim",
   *             "no-string-prototype-trimleft-trimright",
   *             "string-prototype-trimleft-trimright",
   *             "stringPrototypeTrimleftTrimright",
   *             "no-string-prototype-trimstart-trimend",
   *             "string-prototype-trimstart-trimend",
   *             "stringPrototypeTrimstartTrimend",
   *             "no-string-raw",
   *             "string-raw",
   *             "stringRaw",
   *             "no-subclassing-builtins",
   *             "subclassing-builtins",
   *             "subclassingBuiltins",
   *             "no-symbol-prototype-description",
   *             "symbol-prototype-description",
   *             "symbolPrototypeDescription",
   *             "no-symbol",
   *             "symbol",
   *             "no-template-literals",
   *             "template-literals",
   *             "templateLiterals",
   *             "no-top-level-await",
   *             "top-level-await",
   *             "topLevelAwait",
   *             "no-trailing-commas",
   *             "trailing-commas",
   *             "trailingCommas",
   *             "no-trailing-function-commas",
   *             "trailing-function-commas",
   *             "trailingFunctionCommas",
   *             "trailingCommasInFunctions",
   *             "no-typed-arrays",
   *             "typed-arrays",
   *             "typedArrays",
   *             "no-unicode-codepoint-escapes",
   *             "unicode-codepoint-escapes",
   *             "unicodeCodepointEscapes",
   *             "unicodeCodePointEscapes",
   *             "no-weak-map",
   *             "weak-map",
   *             "weakMap",
   *             "no-weak-set",
   *             "weak-set",
   *             "weakSet",
   *             "no-weakrefs",
   *             "weakrefs"
   *           ]
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
    version?: string;
    ignores?: readonly (
      | 'no-accessor-properties'
      | 'accessor-properties'
      | 'accessorProperties'
      | 'no-arbitrary-module-namespace-names'
      | 'arbitrary-module-namespace-names'
      | 'arbitraryModuleNamespaceNames'
      | 'no-array-from'
      | 'array-from'
      | 'arrayFrom'
      | 'no-array-isarray'
      | 'array-isarray'
      | 'arrayIsarray'
      | 'no-array-of'
      | 'array-of'
      | 'arrayOf'
      | 'no-array-prototype-copywithin'
      | 'array-prototype-copywithin'
      | 'arrayPrototypeCopywithin'
      | 'no-array-prototype-entries'
      | 'array-prototype-entries'
      | 'arrayPrototypeEntries'
      | 'no-array-prototype-every'
      | 'array-prototype-every'
      | 'arrayPrototypeEvery'
      | 'no-array-prototype-fill'
      | 'array-prototype-fill'
      | 'arrayPrototypeFill'
      | 'no-array-prototype-filter'
      | 'array-prototype-filter'
      | 'arrayPrototypeFilter'
      | 'no-array-prototype-find'
      | 'array-prototype-find'
      | 'arrayPrototypeFind'
      | 'no-array-prototype-findindex'
      | 'array-prototype-findindex'
      | 'arrayPrototypeFindindex'
      | 'no-array-prototype-findlast-findlastindex'
      | 'array-prototype-findlast-findlastindex'
      | 'arrayPrototypeFindlastFindlastindex'
      | 'no-array-prototype-flat'
      | 'array-prototype-flat'
      | 'arrayPrototypeFlat'
      | 'no-array-prototype-foreach'
      | 'array-prototype-foreach'
      | 'arrayPrototypeForeach'
      | 'no-array-prototype-includes'
      | 'array-prototype-includes'
      | 'arrayPrototypeIncludes'
      | 'no-array-prototype-indexof'
      | 'array-prototype-indexof'
      | 'arrayPrototypeIndexof'
      | 'no-array-prototype-keys'
      | 'array-prototype-keys'
      | 'arrayPrototypeKeys'
      | 'no-array-prototype-lastindexof'
      | 'array-prototype-lastindexof'
      | 'arrayPrototypeLastindexof'
      | 'no-array-prototype-map'
      | 'array-prototype-map'
      | 'arrayPrototypeMap'
      | 'no-array-prototype-reduce'
      | 'array-prototype-reduce'
      | 'arrayPrototypeReduce'
      | 'no-array-prototype-reduceright'
      | 'array-prototype-reduceright'
      | 'arrayPrototypeReduceright'
      | 'no-array-prototype-some'
      | 'array-prototype-some'
      | 'arrayPrototypeSome'
      | 'no-array-prototype-toreversed'
      | 'array-prototype-toreversed'
      | 'arrayPrototypeToreversed'
      | 'no-array-prototype-tosorted'
      | 'array-prototype-tosorted'
      | 'arrayPrototypeTosorted'
      | 'no-array-prototype-tospliced'
      | 'array-prototype-tospliced'
      | 'arrayPrototypeTospliced'
      | 'no-array-prototype-values'
      | 'array-prototype-values'
      | 'arrayPrototypeValues'
      | 'no-array-prototype-with'
      | 'array-prototype-with'
      | 'arrayPrototypeWith'
      | 'no-array-string-prototype-at'
      | 'array-string-prototype-at'
      | 'arrayStringPrototypeAt'
      | 'no-arrow-functions'
      | 'arrow-functions'
      | 'arrowFunctions'
      | 'no-async-functions'
      | 'async-functions'
      | 'asyncFunctions'
      | 'no-async-iteration'
      | 'async-iteration'
      | 'asyncIteration'
      | 'no-atomics-waitasync'
      | 'atomics-waitasync'
      | 'atomicsWaitasync'
      | 'no-atomics'
      | 'atomics'
      | 'no-bigint'
      | 'bigint'
      | 'no-binary-numeric-literals'
      | 'binary-numeric-literals'
      | 'binaryNumericLiterals'
      | 'no-block-scoped-functions'
      | 'block-scoped-functions'
      | 'blockScopedFunctions'
      | 'no-block-scoped-variables'
      | 'block-scoped-variables'
      | 'blockScopedVariables'
      | 'no-class-fields'
      | 'class-fields'
      | 'classFields'
      | 'no-class-static-block'
      | 'class-static-block'
      | 'classStaticBlock'
      | 'no-classes'
      | 'classes'
      | 'no-computed-properties'
      | 'computed-properties'
      | 'computedProperties'
      | 'no-date-now'
      | 'date-now'
      | 'dateNow'
      | 'no-date-prototype-getyear-setyear'
      | 'date-prototype-getyear-setyear'
      | 'datePrototypeGetyearSetyear'
      | 'no-date-prototype-togmtstring'
      | 'date-prototype-togmtstring'
      | 'datePrototypeTogmtstring'
      | 'no-default-parameters'
      | 'default-parameters'
      | 'defaultParameters'
      | 'no-destructuring'
      | 'destructuring'
      | 'no-dynamic-import'
      | 'dynamic-import'
      | 'dynamicImport'
      | 'no-error-cause'
      | 'error-cause'
      | 'errorCause'
      | 'no-escape-unescape'
      | 'escape-unescape'
      | 'escapeUnescape'
      | 'no-exponential-operators'
      | 'exponential-operators'
      | 'exponentialOperators'
      | 'no-export-ns-from'
      | 'export-ns-from'
      | 'exportNsFrom'
      | 'no-for-of-loops'
      | 'for-of-loops'
      | 'forOfLoops'
      | 'no-function-declarations-in-if-statement-clauses-without-block'
      | 'function-declarations-in-if-statement-clauses-without-block'
      | 'functionDeclarationsInIfStatementClausesWithoutBlock'
      | 'no-function-prototype-bind'
      | 'function-prototype-bind'
      | 'functionPrototypeBind'
      | 'no-generators'
      | 'generators'
      | 'no-global-this'
      | 'global-this'
      | 'globalThis'
      | 'no-hashbang'
      | 'hashbang'
      | 'no-import-meta'
      | 'import-meta'
      | 'importMeta'
      | 'no-initializers-in-for-in'
      | 'initializers-in-for-in'
      | 'initializersInForIn'
      | 'no-intl-datetimeformat-prototype-formatrange'
      | 'intl-datetimeformat-prototype-formatrange'
      | 'intlDatetimeformatPrototypeFormatrange'
      | 'no-intl-datetimeformat-prototype-formattoparts'
      | 'intl-datetimeformat-prototype-formattoparts'
      | 'intlDatetimeformatPrototypeFormattoparts'
      | 'no-intl-displaynames'
      | 'intl-displaynames'
      | 'intlDisplaynames'
      | 'no-intl-getcanonicallocales'
      | 'intl-getcanonicallocales'
      | 'intlGetcanonicallocales'
      | 'no-intl-listformat'
      | 'intl-listformat'
      | 'intlListformat'
      | 'no-intl-locale'
      | 'intl-locale'
      | 'intlLocale'
      | 'no-intl-numberformat-prototype-formatrange'
      | 'intl-numberformat-prototype-formatrange'
      | 'intlNumberformatPrototypeFormatrange'
      | 'no-intl-numberformat-prototype-formatrangetoparts'
      | 'intl-numberformat-prototype-formatrangetoparts'
      | 'intlNumberformatPrototypeFormatrangetoparts'
      | 'no-intl-numberformat-prototype-formattoparts'
      | 'intl-numberformat-prototype-formattoparts'
      | 'intlNumberformatPrototypeFormattoparts'
      | 'no-intl-pluralrules-prototype-selectrange'
      | 'intl-pluralrules-prototype-selectrange'
      | 'intlPluralrulesPrototypeSelectrange'
      | 'no-intl-pluralrules'
      | 'intl-pluralrules'
      | 'intlPluralrules'
      | 'no-intl-relativetimeformat'
      | 'intl-relativetimeformat'
      | 'intlRelativetimeformat'
      | 'no-intl-segmenter'
      | 'intl-segmenter'
      | 'intlSegmenter'
      | 'no-intl-supportedvaluesof'
      | 'intl-supportedvaluesof'
      | 'intlSupportedvaluesof'
      | 'no-json-superset'
      | 'json-superset'
      | 'jsonSuperset'
      | 'no-json'
      | 'json'
      | 'no-keyword-properties'
      | 'keyword-properties'
      | 'keywordProperties'
      | 'no-labelled-function-declarations'
      | 'labelled-function-declarations'
      | 'labelledFunctionDeclarations'
      | 'no-legacy-object-prototype-accessor-methods'
      | 'legacy-object-prototype-accessor-methods'
      | 'legacyObjectPrototypeAccessorMethods'
      | 'no-logical-assignment-operators'
      | 'logical-assignment-operators'
      | 'logicalAssignmentOperators'
      | 'no-malformed-template-literals'
      | 'malformed-template-literals'
      | 'malformedTemplateLiterals'
      | 'no-map'
      | 'map'
      | 'no-math-acosh'
      | 'math-acosh'
      | 'mathAcosh'
      | 'no-math-asinh'
      | 'math-asinh'
      | 'mathAsinh'
      | 'no-math-atanh'
      | 'math-atanh'
      | 'mathAtanh'
      | 'no-math-cbrt'
      | 'math-cbrt'
      | 'mathCbrt'
      | 'no-math-clz32'
      | 'math-clz32'
      | 'mathClz32'
      | 'no-math-cosh'
      | 'math-cosh'
      | 'mathCosh'
      | 'no-math-expm1'
      | 'math-expm1'
      | 'mathExpm1'
      | 'no-math-fround'
      | 'math-fround'
      | 'mathFround'
      | 'no-math-hypot'
      | 'math-hypot'
      | 'mathHypot'
      | 'no-math-imul'
      | 'math-imul'
      | 'mathImul'
      | 'no-math-log10'
      | 'math-log10'
      | 'mathLog10'
      | 'no-math-log1p'
      | 'math-log1p'
      | 'mathLog1p'
      | 'no-math-log2'
      | 'math-log2'
      | 'mathLog2'
      | 'no-math-sign'
      | 'math-sign'
      | 'mathSign'
      | 'no-math-sinh'
      | 'math-sinh'
      | 'mathSinh'
      | 'no-math-tanh'
      | 'math-tanh'
      | 'mathTanh'
      | 'no-math-trunc'
      | 'math-trunc'
      | 'mathTrunc'
      | 'no-modules'
      | 'modules'
      | 'no-new-target'
      | 'new-target'
      | 'newTarget'
      | 'new.target'
      | 'no-nullish-coalescing-operators'
      | 'nullish-coalescing-operators'
      | 'nullishCoalescingOperators'
      | 'no-number-epsilon'
      | 'number-epsilon'
      | 'numberEpsilon'
      | 'no-number-isfinite'
      | 'number-isfinite'
      | 'numberIsfinite'
      | 'no-number-isinteger'
      | 'number-isinteger'
      | 'numberIsinteger'
      | 'no-number-isnan'
      | 'number-isnan'
      | 'numberIsnan'
      | 'no-number-issafeinteger'
      | 'number-issafeinteger'
      | 'numberIssafeinteger'
      | 'no-number-maxsafeinteger'
      | 'number-maxsafeinteger'
      | 'numberMaxsafeinteger'
      | 'no-number-minsafeinteger'
      | 'number-minsafeinteger'
      | 'numberMinsafeinteger'
      | 'no-number-parsefloat'
      | 'number-parsefloat'
      | 'numberParsefloat'
      | 'no-number-parseint'
      | 'number-parseint'
      | 'numberParseint'
      | 'no-numeric-separators'
      | 'numeric-separators'
      | 'numericSeparators'
      | 'no-object-assign'
      | 'object-assign'
      | 'objectAssign'
      | 'no-object-create'
      | 'object-create'
      | 'objectCreate'
      | 'no-object-defineproperties'
      | 'object-defineproperties'
      | 'objectDefineproperties'
      | 'no-object-defineproperty'
      | 'object-defineproperty'
      | 'objectDefineproperty'
      | 'no-object-entries'
      | 'object-entries'
      | 'objectEntries'
      | 'no-object-freeze'
      | 'object-freeze'
      | 'objectFreeze'
      | 'no-object-fromentries'
      | 'object-fromentries'
      | 'objectFromentries'
      | 'no-object-getownpropertydescriptor'
      | 'object-getownpropertydescriptor'
      | 'objectGetownpropertydescriptor'
      | 'no-object-getownpropertydescriptors'
      | 'object-getownpropertydescriptors'
      | 'objectGetownpropertydescriptors'
      | 'no-object-getownpropertynames'
      | 'object-getownpropertynames'
      | 'objectGetownpropertynames'
      | 'no-object-getownpropertysymbols'
      | 'object-getownpropertysymbols'
      | 'objectGetownpropertysymbols'
      | 'no-object-getprototypeof'
      | 'object-getprototypeof'
      | 'objectGetprototypeof'
      | 'no-object-hasown'
      | 'object-hasown'
      | 'objectHasown'
      | 'no-object-is'
      | 'object-is'
      | 'objectIs'
      | 'no-object-isextensible'
      | 'object-isextensible'
      | 'objectIsextensible'
      | 'no-object-isfrozen'
      | 'object-isfrozen'
      | 'objectIsfrozen'
      | 'no-object-issealed'
      | 'object-issealed'
      | 'objectIssealed'
      | 'no-object-keys'
      | 'object-keys'
      | 'objectKeys'
      | 'no-object-map-groupby'
      | 'object-map-groupby'
      | 'objectMapGroupby'
      | 'no-object-preventextensions'
      | 'object-preventextensions'
      | 'objectPreventextensions'
      | 'no-object-seal'
      | 'object-seal'
      | 'objectSeal'
      | 'no-object-setprototypeof'
      | 'object-setprototypeof'
      | 'objectSetprototypeof'
      | 'no-object-super-properties'
      | 'object-super-properties'
      | 'objectSuperProperties'
      | 'no-object-values'
      | 'object-values'
      | 'objectValues'
      | 'no-octal-numeric-literals'
      | 'octal-numeric-literals'
      | 'octalNumericLiterals'
      | 'no-optional-catch-binding'
      | 'optional-catch-binding'
      | 'optionalCatchBinding'
      | 'no-optional-chaining'
      | 'optional-chaining'
      | 'optionalChaining'
      | 'no-private-in'
      | 'private-in'
      | 'privateIn'
      | 'no-promise-all-settled'
      | 'promise-all-settled'
      | 'promiseAllSettled'
      | 'no-promise-any'
      | 'promise-any'
      | 'promiseAny'
      | 'no-promise-prototype-finally'
      | 'promise-prototype-finally'
      | 'promisePrototypeFinally'
      | 'no-promise-withresolvers'
      | 'promise-withresolvers'
      | 'promiseWithresolvers'
      | 'no-promise'
      | 'promise'
      | 'no-property-shorthands'
      | 'property-shorthands'
      | 'propertyShorthands'
      | 'no-proxy'
      | 'proxy'
      | 'no-reflect'
      | 'reflect'
      | 'no-regexp-d-flag'
      | 'regexp-d-flag'
      | 'regexpDFlag'
      | 'no-regexp-lookbehind-assertions'
      | 'regexp-lookbehind-assertions'
      | 'regexpLookbehindAssertions'
      | 'regexpLookbehind'
      | 'no-regexp-named-capture-groups'
      | 'regexp-named-capture-groups'
      | 'regexpNamedCaptureGroups'
      | 'no-regexp-prototype-compile'
      | 'regexp-prototype-compile'
      | 'regexpPrototypeCompile'
      | 'no-regexp-prototype-flags'
      | 'regexp-prototype-flags'
      | 'regexpPrototypeFlags'
      | 'no-regexp-s-flag'
      | 'regexp-s-flag'
      | 'regexpSFlag'
      | 'regexpS'
      | 'no-regexp-u-flag'
      | 'regexp-u-flag'
      | 'regexpUFlag'
      | 'regexpU'
      | 'no-regexp-unicode-property-escapes-2019'
      | 'regexp-unicode-property-escapes-2019'
      | 'regexpUnicodePropertyEscapes2019'
      | 'no-regexp-unicode-property-escapes-2020'
      | 'regexp-unicode-property-escapes-2020'
      | 'regexpUnicodePropertyEscapes2020'
      | 'no-regexp-unicode-property-escapes-2021'
      | 'regexp-unicode-property-escapes-2021'
      | 'regexpUnicodePropertyEscapes2021'
      | 'no-regexp-unicode-property-escapes-2022'
      | 'regexp-unicode-property-escapes-2022'
      | 'regexpUnicodePropertyEscapes2022'
      | 'no-regexp-unicode-property-escapes-2023'
      | 'regexp-unicode-property-escapes-2023'
      | 'regexpUnicodePropertyEscapes2023'
      | 'no-regexp-unicode-property-escapes'
      | 'regexp-unicode-property-escapes'
      | 'regexpUnicodePropertyEscapes'
      | 'regexpUnicodeProperties'
      | 'no-regexp-v-flag'
      | 'regexp-v-flag'
      | 'regexpVFlag'
      | 'no-regexp-y-flag'
      | 'regexp-y-flag'
      | 'regexpYFlag'
      | 'regexpY'
      | 'no-resizable-and-growable-arraybuffers'
      | 'resizable-and-growable-arraybuffers'
      | 'resizableAndGrowableArraybuffers'
      | 'no-rest-parameters'
      | 'rest-parameters'
      | 'restParameters'
      | 'no-rest-spread-properties'
      | 'rest-spread-properties'
      | 'restSpreadProperties'
      | 'no-set'
      | 'set'
      | 'no-shadow-catch-param'
      | 'shadow-catch-param'
      | 'shadowCatchParam'
      | 'no-shared-array-buffer'
      | 'shared-array-buffer'
      | 'sharedArrayBuffer'
      | 'no-spread-elements'
      | 'spread-elements'
      | 'spreadElements'
      | 'no-string-create-html-methods'
      | 'string-create-html-methods'
      | 'stringCreateHtmlMethods'
      | 'no-string-fromcodepoint'
      | 'string-fromcodepoint'
      | 'stringFromcodepoint'
      | 'no-string-prototype-codepointat'
      | 'string-prototype-codepointat'
      | 'stringPrototypeCodepointat'
      | 'no-string-prototype-endswith'
      | 'string-prototype-endswith'
      | 'stringPrototypeEndswith'
      | 'no-string-prototype-includes'
      | 'string-prototype-includes'
      | 'stringPrototypeIncludes'
      | 'no-string-prototype-iswellformed-towellformed'
      | 'string-prototype-iswellformed-towellformed'
      | 'stringPrototypeIswellformedTowellformed'
      | 'no-string-prototype-matchall'
      | 'string-prototype-matchall'
      | 'stringPrototypeMatchall'
      | 'no-string-prototype-normalize'
      | 'string-prototype-normalize'
      | 'stringPrototypeNormalize'
      | 'no-string-prototype-padstart-padend'
      | 'string-prototype-padstart-padend'
      | 'stringPrototypePadstartPadend'
      | 'no-string-prototype-repeat'
      | 'string-prototype-repeat'
      | 'stringPrototypeRepeat'
      | 'no-string-prototype-replaceall'
      | 'string-prototype-replaceall'
      | 'stringPrototypeReplaceall'
      | 'no-string-prototype-startswith'
      | 'string-prototype-startswith'
      | 'stringPrototypeStartswith'
      | 'no-string-prototype-substr'
      | 'string-prototype-substr'
      | 'stringPrototypeSubstr'
      | 'no-string-prototype-trim'
      | 'string-prototype-trim'
      | 'stringPrototypeTrim'
      | 'no-string-prototype-trimleft-trimright'
      | 'string-prototype-trimleft-trimright'
      | 'stringPrototypeTrimleftTrimright'
      | 'no-string-prototype-trimstart-trimend'
      | 'string-prototype-trimstart-trimend'
      | 'stringPrototypeTrimstartTrimend'
      | 'no-string-raw'
      | 'string-raw'
      | 'stringRaw'
      | 'no-subclassing-builtins'
      | 'subclassing-builtins'
      | 'subclassingBuiltins'
      | 'no-symbol-prototype-description'
      | 'symbol-prototype-description'
      | 'symbolPrototypeDescription'
      | 'no-symbol'
      | 'symbol'
      | 'no-template-literals'
      | 'template-literals'
      | 'templateLiterals'
      | 'no-top-level-await'
      | 'top-level-await'
      | 'topLevelAwait'
      | 'no-trailing-commas'
      | 'trailing-commas'
      | 'trailingCommas'
      | 'no-trailing-function-commas'
      | 'trailing-function-commas'
      | 'trailingFunctionCommas'
      | 'trailingCommasInFunctions'
      | 'no-typed-arrays'
      | 'typed-arrays'
      | 'typedArrays'
      | 'no-unicode-codepoint-escapes'
      | 'unicode-codepoint-escapes'
      | 'unicodeCodepointEscapes'
      | 'unicodeCodePointEscapes'
      | 'no-weak-map'
      | 'weak-map'
      | 'weakMap'
      | 'no-weak-set'
      | 'weak-set'
      | 'weakSet'
      | 'no-weakrefs'
      | 'weakrefs'
    )[];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description disallow unsupported Node.js built-in APIs on the specified version
 * @link https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-unsupported-features/node-builtins.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | false   |
 *  | recommended | true    |
 *  ```
 */
namespace NoUnsupportedFeaturesNodeBuiltins {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "version": {
   *         "type": "string"
   *       },
   *       "allowExperimental": {
   *         "type": "boolean"
   *       },
   *       "ignores": {
   *         "type": "array",
   *         "items": {
   *           "enum": [
   *             "__filename",
   *             "__dirname",
   *             "require",
   *             "require.cache",
   *             "require.extensions",
   *             "require.main",
   *             "require.resolve",
   *             "require.resolve.paths",
   *             "module",
   *             "module.children",
   *             "module.exports",
   *             "module.filename",
   *             "module.id",
   *             "module.isPreloading",
   *             "module.loaded",
   *             "module.parent",
   *             "module.path",
   *             "module.paths",
   *             "module.require",
   *             "exports",
   *             "AbortController",
   *             "AbortSignal",
   *             "AbortSignal.abort",
   *             "AbortSignal.timeout",
   *             "AbortSignal.any",
   *             "DOMException",
   *             "FormData",
   *             "Headers",
   *             "MessageEvent",
   *             "Navigator",
   *             "Request",
   *             "Response",
   *             "WebAssembly",
   *             "WebSocket",
   *             "fetch",
   *             "global",
   *             "queueMicrotask",
   *             "navigator",
   *             "navigator.hardwareConcurrency",
   *             "navigator.language",
   *             "navigator.languages",
   *             "navigator.platform",
   *             "navigator.userAgent",
   *             "structuredClone",
   *             "localStorage",
   *             "sessionStorage",
   *             "Storage",
   *             "Blob",
   *             "new Buffer()",
   *             "Buffer",
   *             "Buffer.alloc",
   *             "Buffer.allocUnsafe",
   *             "Buffer.allocUnsafeSlow",
   *             "Buffer.byteLength",
   *             "Buffer.compare",
   *             "Buffer.concat",
   *             "Buffer.copyBytesFrom",
   *             "Buffer.from",
   *             "Buffer.isBuffer",
   *             "Buffer.isEncoding",
   *             "File",
   *             "atob",
   *             "btoa",
   *             "console",
   *             "console.profile",
   *             "console.profileEnd",
   *             "console.timeStamp",
   *             "console.Console",
   *             "console.assert",
   *             "console.clear",
   *             "console.count",
   *             "console.countReset",
   *             "console.debug",
   *             "console.dir",
   *             "console.dirxml",
   *             "console.error",
   *             "console.group",
   *             "console.groupCollapsed",
   *             "console.groupEnd",
   *             "console.info",
   *             "console.log",
   *             "console.table",
   *             "console.time",
   *             "console.timeEnd",
   *             "console.timeLog",
   *             "console.trace",
   *             "console.warn",
   *             "crypto",
   *             "crypto.subtle",
   *             "crypto.subtle.decrypt",
   *             "crypto.subtle.deriveBits",
   *             "crypto.subtle.deriveKey",
   *             "crypto.subtle.digest",
   *             "crypto.subtle.encrypt",
   *             "crypto.subtle.exportKey",
   *             "crypto.subtle.generateKey",
   *             "crypto.subtle.importKey",
   *             "crypto.subtle.sign",
   *             "crypto.subtle.unwrapKey",
   *             "crypto.subtle.verify",
   *             "crypto.subtle.wrapKey",
   *             "crypto.getRandomValues",
   *             "crypto.randomUUID",
   *             "Crypto",
   *             "CryptoKey",
   *             "SubtleCrypto",
   *             "CloseEvent",
   *             "CustomEvent",
   *             "Event",
   *             "EventSource",
   *             "EventTarget",
   *             "PerformanceEntry",
   *             "PerformanceMark",
   *             "PerformanceMeasure",
   *             "PerformanceObserver",
   *             "PerformanceObserverEntryList",
   *             "PerformanceResourceTiming",
   *             "performance",
   *             "performance.clearMarks",
   *             "performance.clearMeasures",
   *             "performance.clearResourceTimings",
   *             "performance.eventLoopUtilization",
   *             "performance.getEntries",
   *             "performance.getEntriesByName",
   *             "performance.getEntriesByType",
   *             "performance.mark",
   *             "performance.markResourceTiming",
   *             "performance.measure",
   *             "performance.nodeTiming",
   *             "performance.nodeTiming.bootstrapComplete",
   *             "performance.nodeTiming.environment",
   *             "performance.nodeTiming.idleTime",
   *             "performance.nodeTiming.loopExit",
   *             "performance.nodeTiming.loopStart",
   *             "performance.nodeTiming.nodeStart",
   *             "performance.nodeTiming.uvMetricsInfo",
   *             "performance.nodeTiming.v8Start",
   *             "performance.now",
   *             "performance.onresourcetimingbufferfull",
   *             "performance.setResourceTimingBufferSize",
   *             "performance.timeOrigin",
   *             "performance.timerify",
   *             "performance.toJSON",
   *             "process",
   *             "process.allowedNodeEnvironmentFlags",
   *             "process.availableMemory",
   *             "process.arch",
   *             "process.argv",
   *             "process.argv0",
   *             "process.channel",
   *             "process.config",
   *             "process.connected",
   *             "process.debugPort",
   *             "process.env",
   *             "process.execArgv",
   *             "process.execPath",
   *             "process.execve",
   *             "process.exitCode",
   *             "process.features.cached_builtins",
   *             "process.features.debug",
   *             "process.features.inspector",
   *             "process.features.ipv6",
   *             "process.features.require_module",
   *             "process.features.tls",
   *             "process.features.tls_alpn",
   *             "process.features.tls_ocsp",
   *             "process.features.tls_sni",
   *             "process.features.typescript",
   *             "process.features.uv",
   *             "process.finalization.register",
   *             "process.finalization.registerBeforeExit",
   *             "process.finalization.unregister",
   *             "process.getBuiltinModule",
   *             "process.mainModule",
   *             "process.noDeprecation",
   *             "process.permission",
   *             "process.pid",
   *             "process.platform",
   *             "process.ppid",
   *             "process.ref",
   *             "process.release",
   *             "process.report",
   *             "process.report.excludeEnv",
   *             "process.sourceMapsEnabled",
   *             "process.stdin",
   *             "process.stdin.isRaw",
   *             "process.stdin.isTTY",
   *             "process.stdin.setRawMode",
   *             "process.stdout",
   *             "process.stdout.clearLine",
   *             "process.stdout.clearScreenDown",
   *             "process.stdout.columns",
   *             "process.stdout.cursorTo",
   *             "process.stdout.getColorDepth",
   *             "process.stdout.getWindowSize",
   *             "process.stdout.hasColors",
   *             "process.stdout.isTTY",
   *             "process.stdout.moveCursor",
   *             "process.stdout.rows",
   *             "process.stderr",
   *             "process.stderr.clearLine",
   *             "process.stderr.clearScreenDown",
   *             "process.stderr.columns",
   *             "process.stderr.cursorTo",
   *             "process.stderr.getColorDepth",
   *             "process.stderr.getWindowSize",
   *             "process.stderr.hasColors",
   *             "process.stderr.isTTY",
   *             "process.stderr.moveCursor",
   *             "process.stderr.rows",
   *             "process.threadCpuUsage",
   *             "process.throwDeprecation",
   *             "process.title",
   *             "process.traceDeprecation",
   *             "process.version",
   *             "process.versions",
   *             "process.abort",
   *             "process.chdir",
   *             "process.constrainedMemory",
   *             "process.cpuUsage",
   *             "process.cwd",
   *             "process.disconnect",
   *             "process.dlopen",
   *             "process.emitWarning",
   *             "process.exit",
   *             "process.getActiveResourcesInfo",
   *             "process.getegid",
   *             "process.geteuid",
   *             "process.getgid",
   *             "process.getgroups",
   *             "process.getuid",
   *             "process.hasUncaughtExceptionCaptureCallback",
   *             "process.hrtime",
   *             "process.hrtime.bigint",
   *             "process.initgroups",
   *             "process.kill",
   *             "process.loadEnvFile",
   *             "process.memoryUsage",
   *             "process.rss",
   *             "process.nextTick",
   *             "process.resourceUsage",
   *             "process.send",
   *             "process.setegid",
   *             "process.seteuid",
   *             "process.setgid",
   *             "process.setgroups",
   *             "process.setuid",
   *             "process.setSourceMapsEnabled",
   *             "process.setUncaughtExceptionCaptureCallback",
   *             "process.umask",
   *             "process.unref",
   *             "process.uptime",
   *             "ReadableStream",
   *             "ReadableStream.from",
   *             "ReadableStreamDefaultReader",
   *             "ReadableStreamBYOBReader",
   *             "ReadableStreamDefaultController",
   *             "ReadableByteStreamController",
   *             "ReadableStreamBYOBRequest",
   *             "WritableStream",
   *             "WritableStreamDefaultWriter",
   *             "WritableStreamDefaultController",
   *             "TransformStream",
   *             "TransformStreamDefaultController",
   *             "ByteLengthQueuingStrategy",
   *             "CountQueuingStrategy",
   *             "TextEncoderStream",
   *             "TextDecoderStream",
   *             "CompressionStream",
   *             "DecompressionStream",
   *             "setInterval",
   *             "clearInterval",
   *             "setTimeout",
   *             "clearTimeout",
   *             "setImmediate",
   *             "clearImmediate",
   *             "URL",
   *             "URL.canParse",
   *             "URL.createObjectURL",
   *             "URL.revokeObjectURL",
   *             "URLSearchParams",
   *             "TextDecoder",
   *             "TextEncoder",
   *             "BroadcastChannel",
   *             "MessageChannel",
   *             "MessagePort",
   *             "assert",
   *             "assert.Assert",
   *             "assert.assert",
   *             "assert.deepEqual",
   *             "assert.deepStrictEqual",
   *             "assert.doesNotMatch",
   *             "assert.doesNotReject",
   *             "assert.doesNotThrow",
   *             "assert.equal",
   *             "assert.fail",
   *             "assert.ifError",
   *             "assert.match",
   *             "assert.notDeepEqual",
   *             "assert.notDeepStrictEqual",
   *             "assert.notEqual",
   *             "assert.notStrictEqual",
   *             "assert.ok",
   *             "assert.partialDeepStrictEqual",
   *             "assert.rejects",
   *             "assert.strictEqual",
   *             "assert.throws",
   *             "assert.CallTracker",
   *             "assert.strict",
   *             "assert.strict.Assert",
   *             "assert.strict.assert",
   *             "assert.strict.deepEqual",
   *             "assert.strict.deepStrictEqual",
   *             "assert.strict.doesNotMatch",
   *             "assert.strict.doesNotReject",
   *             "assert.strict.doesNotThrow",
   *             "assert.strict.equal",
   *             "assert.strict.fail",
   *             "assert.strict.ifError",
   *             "assert.strict.match",
   *             "assert.strict.notDeepEqual",
   *             "assert.strict.notDeepStrictEqual",
   *             "assert.strict.notEqual",
   *             "assert.strict.notStrictEqual",
   *             "assert.strict.ok",
   *             "assert.strict.partialDeepStrictEqual",
   *             "assert.strict.rejects",
   *             "assert.strict.strictEqual",
   *             "assert.strict.throws",
   *             "assert.strict.CallTracker",
   *             "assert/strict",
   *             "assert/strict.Assert",
   *             "assert/strict.assert",
   *             "assert/strict.deepEqual",
   *             "assert/strict.deepStrictEqual",
   *             "assert/strict.doesNotMatch",
   *             "assert/strict.doesNotReject",
   *             "assert/strict.doesNotThrow",
   *             "assert/strict.equal",
   *             "assert/strict.fail",
   *             "assert/strict.ifError",
   *             "assert/strict.match",
   *             "assert/strict.notDeepEqual",
   *             "assert/strict.notDeepStrictEqual",
   *             "assert/strict.notEqual",
   *             "assert/strict.notStrictEqual",
   *             "assert/strict.ok",
   *             "assert/strict.partialDeepStrictEqual",
   *             "assert/strict.rejects",
   *             "assert/strict.strictEqual",
   *             "assert/strict.throws",
   *             "assert/strict.CallTracker",
   *             "async_hooks",
   *             "async_hooks.createHook",
   *             "async_hooks.executionAsyncResource",
   *             "async_hooks.executionAsyncId",
   *             "async_hooks.triggerAsyncId",
   *             "async_hooks.AsyncLocalStorage",
   *             "async_hooks.AsyncLocalStorage.bind",
   *             "async_hooks.AsyncLocalStorage.snapshot",
   *             "async_hooks.AsyncResource",
   *             "async_hooks.AsyncResource.bind",
   *             "buffer",
   *             "buffer.constants",
   *             "buffer.INSPECT_MAX_BYTES",
   *             "buffer.kMaxLength",
   *             "buffer.kStringMaxLength",
   *             "buffer.atob",
   *             "buffer.btoa",
   *             "buffer.isAscii",
   *             "buffer.isUtf8",
   *             "buffer.resolveObjectURL",
   *             "buffer.transcode",
   *             "buffer.SlowBuffer",
   *             "buffer.Blob",
   *             "new buffer.Buffer()",
   *             "buffer.Buffer",
   *             "buffer.Buffer.alloc",
   *             "buffer.Buffer.allocUnsafe",
   *             "buffer.Buffer.allocUnsafeSlow",
   *             "buffer.Buffer.byteLength",
   *             "buffer.Buffer.compare",
   *             "buffer.Buffer.concat",
   *             "buffer.Buffer.copyBytesFrom",
   *             "buffer.Buffer.from",
   *             "buffer.Buffer.isBuffer",
   *             "buffer.Buffer.isEncoding",
   *             "buffer.File",
   *             "child_process",
   *             "child_process.exec",
   *             "child_process.execFile",
   *             "child_process.fork",
   *             "child_process.spawn",
   *             "child_process.execFileSync",
   *             "child_process.execSync",
   *             "child_process.spawnSync",
   *             "child_process.ChildProcess",
   *             "cluster",
   *             "cluster.isMaster",
   *             "cluster.isPrimary",
   *             "cluster.isWorker",
   *             "cluster.schedulingPolicy",
   *             "cluster.settings",
   *             "cluster.worker",
   *             "cluster.workers",
   *             "cluster.disconnect",
   *             "cluster.fork",
   *             "cluster.setupMaster",
   *             "cluster.setupPrimary",
   *             "cluster.Worker",
   *             "crypto.constants",
   *             "crypto.fips",
   *             "crypto.webcrypto",
   *             "crypto.webcrypto.subtle",
   *             "crypto.webcrypto.subtle.decrypt",
   *             "crypto.webcrypto.subtle.deriveBits",
   *             "crypto.webcrypto.subtle.deriveKey",
   *             "crypto.webcrypto.subtle.digest",
   *             "crypto.webcrypto.subtle.encrypt",
   *             "crypto.webcrypto.subtle.exportKey",
   *             "crypto.webcrypto.subtle.generateKey",
   *             "crypto.webcrypto.subtle.importKey",
   *             "crypto.webcrypto.subtle.sign",
   *             "crypto.webcrypto.subtle.unwrapKey",
   *             "crypto.webcrypto.subtle.verify",
   *             "crypto.webcrypto.subtle.wrapKey",
   *             "crypto.webcrypto.getRandomValues",
   *             "crypto.webcrypto.randomUUID",
   *             "crypto.checkPrime",
   *             "crypto.checkPrimeSync",
   *             "crypto.createCipher",
   *             "crypto.createCipheriv",
   *             "crypto.createDecipher",
   *             "crypto.createDecipheriv",
   *             "crypto.createDiffieHellman",
   *             "crypto.createDiffieHellmanGroup",
   *             "crypto.createECDH",
   *             "crypto.createHash",
   *             "crypto.createHmac",
   *             "crypto.createPrivateKey",
   *             "crypto.createPublicKey",
   *             "crypto.createSecretKey",
   *             "crypto.createSign",
   *             "crypto.createVerify",
   *             "crypto.diffieHellman",
   *             "crypto.generateKey",
   *             "crypto.generateKeyPair",
   *             "crypto.generateKeyPairSync",
   *             "crypto.generateKeySync",
   *             "crypto.generatePrime",
   *             "crypto.generatePrimeSync",
   *             "crypto.getCipherInfo",
   *             "crypto.getCiphers",
   *             "crypto.getCurves",
   *             "crypto.getDiffieHellman",
   *             "crypto.getFips",
   *             "crypto.getHashes",
   *             "crypto.hash",
   *             "crypto.hkdf",
   *             "crypto.hkdfSync",
   *             "crypto.pbkdf2",
   *             "crypto.pbkdf2Sync",
   *             "crypto.privateDecrypt",
   *             "crypto.privateEncrypt",
   *             "crypto.publicDecrypt",
   *             "crypto.publicEncrypt",
   *             "crypto.randomBytes",
   *             "crypto.randomFillSync",
   *             "crypto.randomFill",
   *             "crypto.randomInt",
   *             "crypto.scrypt",
   *             "crypto.scryptSync",
   *             "crypto.secureHeapUsed",
   *             "crypto.setEngine",
   *             "crypto.setFips",
   *             "crypto.sign",
   *             "crypto.timingSafeEqual",
   *             "crypto.verify",
   *             "crypto.Certificate",
   *             "crypto.Certificate.exportChallenge",
   *             "crypto.Certificate.exportPublicKey",
   *             "crypto.Certificate.verifySpkac",
   *             "crypto.Cipher",
   *             "crypto.Decipher",
   *             "crypto.DiffieHellman",
   *             "crypto.DiffieHellmanGroup",
   *             "crypto.ECDH",
   *             "crypto.ECDH.convertKey",
   *             "crypto.Hash()",
   *             "new crypto.Hash()",
   *             "crypto.Hash",
   *             "crypto.Hmac()",
   *             "new crypto.Hmac()",
   *             "crypto.Hmac",
   *             "crypto.KeyObject",
   *             "crypto.KeyObject.from",
   *             "crypto.Sign",
   *             "crypto.Verify",
   *             "crypto.X509Certificate",
   *             "dgram",
   *             "dgram.createSocket",
   *             "dgram.Socket",
   *             "diagnostics_channel",
   *             "diagnostics_channel.hasSubscribers",
   *             "diagnostics_channel.channel",
   *             "diagnostics_channel.subscribe",
   *             "diagnostics_channel.unsubscribe",
   *             "diagnostics_channel.tracingChannel",
   *             "diagnostics_channel.Channel",
   *             "diagnostics_channel.TracingChannel",
   *             "dns",
   *             "dns.Resolver",
   *             "dns.getServers",
   *             "dns.lookup",
   *             "dns.lookupService",
   *             "dns.resolve",
   *             "dns.resolve4",
   *             "dns.resolve6",
   *             "dns.resolveAny",
   *             "dns.resolveCname",
   *             "dns.resolveCaa",
   *             "dns.resolveMx",
   *             "dns.resolveNaptr",
   *             "dns.resolveNs",
   *             "dns.resolvePtr",
   *             "dns.resolveSoa",
   *             "dns.resolveSrv",
   *             "dns.resolveTlsa",
   *             "dns.resolveTxt",
   *             "dns.reverse",
   *             "dns.setDefaultResultOrder",
   *             "dns.getDefaultResultOrder",
   *             "dns.setServers",
   *             "dns.promises",
   *             "dns.promises.Resolver",
   *             "dns.promises.cancel",
   *             "dns.promises.getServers",
   *             "dns.promises.lookup",
   *             "dns.promises.lookupService",
   *             "dns.promises.resolve",
   *             "dns.promises.resolve4",
   *             "dns.promises.resolve6",
   *             "dns.promises.resolveAny",
   *             "dns.promises.resolveCaa",
   *             "dns.promises.resolveCname",
   *             "dns.promises.resolveMx",
   *             "dns.promises.resolveNaptr",
   *             "dns.promises.resolveNs",
   *             "dns.promises.resolvePtr",
   *             "dns.promises.resolveSoa",
   *             "dns.promises.resolveSrv",
   *             "dns.promises.resolveTlsa",
   *             "dns.promises.resolveTxt",
   *             "dns.promises.reverse",
   *             "dns.promises.setDefaultResultOrder",
   *             "dns.promises.getDefaultResultOrder",
   *             "dns.promises.setServers",
   *             "dns/promises",
   *             "dns/promises.Resolver",
   *             "dns/promises.cancel",
   *             "dns/promises.getServers",
   *             "dns/promises.lookup",
   *             "dns/promises.lookupService",
   *             "dns/promises.resolve",
   *             "dns/promises.resolve4",
   *             "dns/promises.resolve6",
   *             "dns/promises.resolveAny",
   *             "dns/promises.resolveCaa",
   *             "dns/promises.resolveCname",
   *             "dns/promises.resolveMx",
   *             "dns/promises.resolveNaptr",
   *             "dns/promises.resolveNs",
   *             "dns/promises.resolvePtr",
   *             "dns/promises.resolveSoa",
   *             "dns/promises.resolveSrv",
   *             "dns/promises.resolveTlsa",
   *             "dns/promises.resolveTxt",
   *             "dns/promises.reverse",
   *             "dns/promises.setDefaultResultOrder",
   *             "dns/promises.getDefaultResultOrder",
   *             "dns/promises.setServers",
   *             "domain",
   *             "domain.create",
   *             "domain.Domain",
   *             "events",
   *             "events.Event",
   *             "events.EventTarget",
   *             "events.CustomEvent",
   *             "events.NodeEventTarget",
   *             "events.EventEmitter",
   *             "events.EventEmitter.defaultMaxListeners",
   *             "events.EventEmitter.errorMonitor",
   *             "events.EventEmitter.captureRejections",
   *             "events.EventEmitter.captureRejectionSymbol",
   *             "events.EventEmitter.getEventListeners",
   *             "events.EventEmitter.getMaxListeners",
   *             "events.EventEmitter.once",
   *             "events.EventEmitter.listenerCount",
   *             "events.EventEmitter.on",
   *             "events.EventEmitter.setMaxListeners",
   *             "events.EventEmitter.addAbortListener",
   *             "events.EventEmitterAsyncResource",
   *             "events.EventEmitterAsyncResource.defaultMaxListeners",
   *             "events.EventEmitterAsyncResource.errorMonitor",
   *             "events.EventEmitterAsyncResource.captureRejections",
   *             "events.EventEmitterAsyncResource.captureRejectionSymbol",
   *             "events.EventEmitterAsyncResource.getEventListeners",
   *             "events.EventEmitterAsyncResource.getMaxListeners",
   *             "events.EventEmitterAsyncResource.once",
   *             "events.EventEmitterAsyncResource.listenerCount",
   *             "events.EventEmitterAsyncResource.on",
   *             "events.EventEmitterAsyncResource.setMaxListeners",
   *             "events.EventEmitterAsyncResource.addAbortListener",
   *             "events.defaultMaxListeners",
   *             "events.errorMonitor",
   *             "events.captureRejections",
   *             "events.captureRejectionSymbol",
   *             "events.getEventListeners",
   *             "events.getMaxListeners",
   *             "events.once",
   *             "events.listenerCount",
   *             "events.on",
   *             "events.setMaxListeners",
   *             "events.addAbortListener",
   *             "fs",
   *             "fs.promises",
   *             "fs.promises.FileHandle",
   *             "fs.promises.access",
   *             "fs.promises.appendFile",
   *             "fs.promises.chmod",
   *             "fs.promises.chown",
   *             "fs.promises.constants",
   *             "fs.promises.copyFile",
   *             "fs.promises.cp",
   *             "fs.promises.glob",
   *             "fs.promises.lchmod",
   *             "fs.promises.lchown",
   *             "fs.promises.link",
   *             "fs.promises.lstat",
   *             "fs.promises.lutimes",
   *             "fs.promises.mkdir",
   *             "fs.promises.mkdtemp",
   *             "fs.promises.open",
   *             "fs.promises.opendir",
   *             "fs.promises.readFile",
   *             "fs.promises.readdir",
   *             "fs.promises.readlink",
   *             "fs.promises.realpath",
   *             "fs.promises.rename",
   *             "fs.promises.rm",
   *             "fs.promises.rmdir",
   *             "fs.promises.stat",
   *             "fs.promises.statfs",
   *             "fs.promises.symlink",
   *             "fs.promises.truncate",
   *             "fs.promises.unlink",
   *             "fs.promises.utimes",
   *             "fs.promises.watch",
   *             "fs.promises.writeFile",
   *             "fs.access",
   *             "fs.appendFile",
   *             "fs.chmod",
   *             "fs.chown",
   *             "fs.close",
   *             "fs.copyFile",
   *             "fs.cp",
   *             "fs.createReadStream",
   *             "fs.createWriteStream",
   *             "fs.exists",
   *             "fs.fchmod",
   *             "fs.fchown",
   *             "fs.fdatasync",
   *             "fs.fstat",
   *             "fs.fsync",
   *             "fs.ftruncate",
   *             "fs.futimes",
   *             "fs.glob",
   *             "fs.lchmod",
   *             "fs.lchown",
   *             "fs.link",
   *             "fs.lstat",
   *             "fs.lutimes",
   *             "fs.mkdir",
   *             "fs.mkdtemp",
   *             "fs.native",
   *             "fs.open",
   *             "fs.openAsBlob",
   *             "fs.opendir",
   *             "fs.read",
   *             "fs.readdir",
   *             "fs.readFile",
   *             "fs.readlink",
   *             "fs.readv",
   *             "fs.realpath",
   *             "fs.realpath.native",
   *             "fs.rename",
   *             "fs.rm",
   *             "fs.rmdir",
   *             "fs.stat",
   *             "fs.statfs",
   *             "fs.symlink",
   *             "fs.truncate",
   *             "fs.unlink",
   *             "fs.unwatchFile",
   *             "fs.utimes",
   *             "fs.watch",
   *             "fs.watchFile",
   *             "fs.write",
   *             "fs.writeFile",
   *             "fs.writev",
   *             "fs.accessSync",
   *             "fs.appendFileSync",
   *             "fs.chmodSync",
   *             "fs.chownSync",
   *             "fs.closeSync",
   *             "fs.copyFileSync",
   *             "fs.cpSync",
   *             "fs.existsSync",
   *             "fs.fchmodSync",
   *             "fs.fchownSync",
   *             "fs.fdatasyncSync",
   *             "fs.fstatSync",
   *             "fs.fsyncSync",
   *             "fs.ftruncateSync",
   *             "fs.futimesSync",
   *             "fs.globSync",
   *             "fs.lchmodSync",
   *             "fs.lchownSync",
   *             "fs.linkSync",
   *             "fs.lstatSync",
   *             "fs.lutimesSync",
   *             "fs.mkdirSync",
   *             "fs.mkdtempSync",
   *             "fs.opendirSync",
   *             "fs.openSync",
   *             "fs.readdirSync",
   *             "fs.readFileSync",
   *             "fs.readlinkSync",
   *             "fs.readSync",
   *             "fs.readvSync",
   *             "fs.realpathSync",
   *             "fs.realpathSync.native",
   *             "fs.renameSync",
   *             "fs.rmdirSync",
   *             "fs.rmSync",
   *             "fs.statfsSync",
   *             "fs.statSync",
   *             "fs.symlinkSync",
   *             "fs.truncateSync",
   *             "fs.unlinkSync",
   *             "fs.utimesSync",
   *             "fs.writeFileSync",
   *             "fs.writeSync",
   *             "fs.writevSync",
   *             "fs.constants",
   *             "fs.Dir",
   *             "fs.Dirent",
   *             "fs.FSWatcher",
   *             "fs.StatWatcher",
   *             "fs.ReadStream",
   *             "fs.Stats()",
   *             "new fs.Stats()",
   *             "fs.Stats",
   *             "fs.StatFs",
   *             "fs.WriteStream",
   *             "fs.common_objects",
   *             "fs/promises",
   *             "fs/promises.FileHandle",
   *             "fs/promises.access",
   *             "fs/promises.appendFile",
   *             "fs/promises.chmod",
   *             "fs/promises.chown",
   *             "fs/promises.constants",
   *             "fs/promises.copyFile",
   *             "fs/promises.cp",
   *             "fs/promises.glob",
   *             "fs/promises.lchmod",
   *             "fs/promises.lchown",
   *             "fs/promises.link",
   *             "fs/promises.lstat",
   *             "fs/promises.lutimes",
   *             "fs/promises.mkdir",
   *             "fs/promises.mkdtemp",
   *             "fs/promises.open",
   *             "fs/promises.opendir",
   *             "fs/promises.readFile",
   *             "fs/promises.readdir",
   *             "fs/promises.readlink",
   *             "fs/promises.realpath",
   *             "fs/promises.rename",
   *             "fs/promises.rm",
   *             "fs/promises.rmdir",
   *             "fs/promises.stat",
   *             "fs/promises.statfs",
   *             "fs/promises.symlink",
   *             "fs/promises.truncate",
   *             "fs/promises.unlink",
   *             "fs/promises.utimes",
   *             "fs/promises.watch",
   *             "fs/promises.writeFile",
   *             "http2",
   *             "http2.constants",
   *             "http2.sensitiveHeaders",
   *             "http2.createServer",
   *             "http2.createSecureServer",
   *             "http2.connect",
   *             "http2.getDefaultSettings",
   *             "http2.getPackedSettings",
   *             "http2.getUnpackedSettings",
   *             "http2.performServerHandshake",
   *             "http2.Http2Session",
   *             "http2.ServerHttp2Session",
   *             "http2.ClientHttp2Session",
   *             "http2.Http2Stream",
   *             "http2.ClientHttp2Stream",
   *             "http2.ServerHttp2Stream",
   *             "http2.Http2Server",
   *             "http2.Http2SecureServer",
   *             "http2.Http2ServerRequest",
   *             "http2.Http2ServerResponse",
   *             "http",
   *             "http.METHODS",
   *             "http.STATUS_CODES",
   *             "http.globalAgent",
   *             "http.maxHeaderSize",
   *             "http.createServer",
   *             "http.get",
   *             "http.request",
   *             "http.validateHeaderName",
   *             "http.validateHeaderValue",
   *             "http.setMaxIdleHTTPParsers",
   *             "http.Agent",
   *             "http.ClientRequest",
   *             "http.Server",
   *             "http.ServerResponse",
   *             "http.IncomingMessage",
   *             "http.OutgoingMessage",
   *             "http.WebSocket",
   *             "_http_agent",
   *             "_http_client",
   *             "_http_common",
   *             "_http_incoming",
   *             "_http_outgoing",
   *             "_http_server",
   *             "https",
   *             "https.globalAgent",
   *             "https.createServer",
   *             "https.get",
   *             "https.request",
   *             "https.Agent",
   *             "https.Server",
   *             "inspector",
   *             "inspector.Session",
   *             "inspector.Network.dataReceived",
   *             "inspector.Network.dataSent",
   *             "inspector.Network.loadingFailed",
   *             "inspector.Network.loadingFinished",
   *             "inspector.Network.requestWillBeSent",
   *             "inspector.Network.responseReceived",
   *             "inspector.NetworkResources.put",
   *             "inspector.console",
   *             "inspector.close",
   *             "inspector.open",
   *             "inspector.url",
   *             "inspector.waitForDebugger",
   *             "inspector/promises",
   *             "inspector/promises.Session",
   *             "inspector/promises.Network.dataReceived",
   *             "inspector/promises.Network.dataSent",
   *             "inspector/promises.Network.loadingFailed",
   *             "inspector/promises.Network.loadingFinished",
   *             "inspector/promises.Network.requestWillBeSent",
   *             "inspector/promises.Network.responseReceived",
   *             "inspector/promises.NetworkResources.put",
   *             "inspector/promises.console",
   *             "inspector/promises.close",
   *             "inspector/promises.open",
   *             "inspector/promises.url",
   *             "inspector/promises.waitForDebugger",
   *             "module.builtinModules",
   *             "module.constants.compileCacheStatus",
   *             "module.createRequire",
   *             "module.createRequireFromPath",
   *             "module.enableCompileCache",
   *             "module.findPackageJSON",
   *             "module.flushCompileCache",
   *             "module.getCompileCacheDir",
   *             "module.getSourceMapsSupport",
   *             "module.isBuiltin",
   *             "module.registerHooks",
   *             "module.register",
   *             "module.setSourceMapsSupport",
   *             "module.stripTypeScriptTypes",
   *             "module.syncBuiltinESMExports",
   *             "module.findSourceMap",
   *             "module.SourceMap",
   *             "module.Module.builtinModules",
   *             "module.Module.createRequire",
   *             "module.Module.createRequireFromPath",
   *             "module.Module.enableCompileCache",
   *             "module.Module.findPackageJSON",
   *             "module.Module.flushCompileCache",
   *             "module.Module.getCompileCacheDir",
   *             "module.Module.getSourceMapsSupport",
   *             "module.Module.isBuiltin",
   *             "module.Module.registerHooks",
   *             "module.Module.register",
   *             "module.Module.setSourceMapsSupport",
   *             "module.Module.stripTypeScriptTypes",
   *             "module.Module.syncBuiltinESMExports",
   *             "module.Module.findSourceMap",
   *             "module.Module.SourceMap",
   *             "net",
   *             "net.connect",
   *             "net.createConnection",
   *             "net.createServer",
   *             "net.getDefaultAutoSelectFamily",
   *             "net.setDefaultAutoSelectFamily",
   *             "net.getDefaultAutoSelectFamilyAttemptTimeout",
   *             "net.setDefaultAutoSelectFamilyAttemptTimeout",
   *             "net.isIP",
   *             "net.isIPv4",
   *             "net.isIPv6",
   *             "net.BlockList",
   *             "net.BlockList.isBlockList",
   *             "net.SocketAddress",
   *             "net.SocketAddress.parse",
   *             "net.Server",
   *             "net.Socket",
   *             "os",
   *             "os.EOL",
   *             "os.constants",
   *             "os.constants.priority",
   *             "os.devNull",
   *             "os.availableParallelism",
   *             "os.arch",
   *             "os.cpus",
   *             "os.endianness",
   *             "os.freemem",
   *             "os.getPriority",
   *             "os.homedir",
   *             "os.hostname",
   *             "os.loadavg",
   *             "os.machine",
   *             "os.networkInterfaces",
   *             "os.platform",
   *             "os.release",
   *             "os.setPriority",
   *             "os.tmpdir",
   *             "os.totalmem",
   *             "os.type",
   *             "os.uptime",
   *             "os.userInfo",
   *             "os.version",
   *             "path",
   *             "path.posix",
   *             "path.posix.delimiter",
   *             "path.posix.sep",
   *             "path.posix.basename",
   *             "path.posix.dirname",
   *             "path.posix.extname",
   *             "path.posix.format",
   *             "path.posix.matchesGlob",
   *             "path.posix.isAbsolute",
   *             "path.posix.join",
   *             "path.posix.normalize",
   *             "path.posix.parse",
   *             "path.posix.relative",
   *             "path.posix.resolve",
   *             "path.posix.toNamespacedPath",
   *             "path.win32",
   *             "path.win32.delimiter",
   *             "path.win32.sep",
   *             "path.win32.basename",
   *             "path.win32.dirname",
   *             "path.win32.extname",
   *             "path.win32.format",
   *             "path.win32.matchesGlob",
   *             "path.win32.isAbsolute",
   *             "path.win32.join",
   *             "path.win32.normalize",
   *             "path.win32.parse",
   *             "path.win32.relative",
   *             "path.win32.resolve",
   *             "path.win32.toNamespacedPath",
   *             "path.delimiter",
   *             "path.sep",
   *             "path.basename",
   *             "path.dirname",
   *             "path.extname",
   *             "path.format",
   *             "path.matchesGlob",
   *             "path.isAbsolute",
   *             "path.join",
   *             "path.normalize",
   *             "path.parse",
   *             "path.relative",
   *             "path.resolve",
   *             "path.toNamespacedPath",
   *             "path/posix",
   *             "path/posix.delimiter",
   *             "path/posix.sep",
   *             "path/posix.basename",
   *             "path/posix.dirname",
   *             "path/posix.extname",
   *             "path/posix.format",
   *             "path/posix.matchesGlob",
   *             "path/posix.isAbsolute",
   *             "path/posix.join",
   *             "path/posix.normalize",
   *             "path/posix.parse",
   *             "path/posix.relative",
   *             "path/posix.resolve",
   *             "path/posix.toNamespacedPath",
   *             "path/win32",
   *             "path/win32.delimiter",
   *             "path/win32.sep",
   *             "path/win32.basename",
   *             "path/win32.dirname",
   *             "path/win32.extname",
   *             "path/win32.format",
   *             "path/win32.matchesGlob",
   *             "path/win32.isAbsolute",
   *             "path/win32.join",
   *             "path/win32.normalize",
   *             "path/win32.parse",
   *             "path/win32.relative",
   *             "path/win32.resolve",
   *             "path/win32.toNamespacedPath",
   *             "perf_hooks",
   *             "perf_hooks.performance",
   *             "perf_hooks.performance.clearMarks",
   *             "perf_hooks.performance.clearMeasures",
   *             "perf_hooks.performance.clearResourceTimings",
   *             "perf_hooks.performance.eventLoopUtilization",
   *             "perf_hooks.performance.getEntries",
   *             "perf_hooks.performance.getEntriesByName",
   *             "perf_hooks.performance.getEntriesByType",
   *             "perf_hooks.performance.mark",
   *             "perf_hooks.performance.markResourceTiming",
   *             "perf_hooks.performance.measure",
   *             "perf_hooks.performance.nodeTiming",
   *             "perf_hooks.performance.nodeTiming.bootstrapComplete",
   *             "perf_hooks.performance.nodeTiming.environment",
   *             "perf_hooks.performance.nodeTiming.idleTime",
   *             "perf_hooks.performance.nodeTiming.loopExit",
   *             "perf_hooks.performance.nodeTiming.loopStart",
   *             "perf_hooks.performance.nodeTiming.nodeStart",
   *             "perf_hooks.performance.nodeTiming.uvMetricsInfo",
   *             "perf_hooks.performance.nodeTiming.v8Start",
   *             "perf_hooks.performance.now",
   *             "perf_hooks.performance.onresourcetimingbufferfull",
   *             "perf_hooks.performance.setResourceTimingBufferSize",
   *             "perf_hooks.performance.timeOrigin",
   *             "perf_hooks.performance.timerify",
   *             "perf_hooks.performance.toJSON",
   *             "perf_hooks.createHistogram",
   *             "perf_hooks.monitorEventLoopDelay",
   *             "perf_hooks.PerformanceEntry",
   *             "perf_hooks.PerformanceMark",
   *             "perf_hooks.PerformanceMeasure",
   *             "perf_hooks.PerformanceNodeEntry",
   *             "perf_hooks.PerformanceNodeTiming",
   *             "perf_hooks.PerformanceResourceTiming",
   *             "perf_hooks.PerformanceObserver",
   *             "perf_hooks.PerformanceObserverEntryList",
   *             "perf_hooks.Histogram",
   *             "perf_hooks.IntervalHistogram",
   *             "perf_hooks.RecordableHistogram",
   *             "punycode",
   *             "punycode.ucs2",
   *             "punycode.version",
   *             "punycode.decode",
   *             "punycode.encode",
   *             "punycode.toASCII",
   *             "punycode.toUnicode",
   *             "querystring",
   *             "querystring.decode",
   *             "querystring.encode",
   *             "querystring.escape",
   *             "querystring.parse",
   *             "querystring.stringify",
   *             "querystring.unescape",
   *             "readline",
   *             "readline.promises",
   *             "readline.promises.createInterface",
   *             "readline.promises.Interface",
   *             "readline.promises.Readline",
   *             "readline.clearLine",
   *             "readline.clearScreenDown",
   *             "readline.createInterface",
   *             "readline.cursorTo",
   *             "readline.moveCursor",
   *             "readline.Interface",
   *             "readline.emitKeypressEvents",
   *             "readline.InterfaceConstructor",
   *             "readline/promises",
   *             "readline/promises.createInterface",
   *             "readline/promises.Interface",
   *             "readline/promises.Readline",
   *             "repl",
   *             "repl.start",
   *             "repl.writer",
   *             "repl.REPLServer()",
   *             "repl.REPLServer",
   *             "repl.REPL_MODE_MAGIC",
   *             "repl.REPL_MODE_SLOPPY",
   *             "repl.REPL_MODE_STRICT",
   *             "repl.Recoverable()",
   *             "repl.Recoverable",
   *             "repl.builtinModules",
   *             "sea",
   *             "sea.isSea",
   *             "sea.getAsset",
   *             "sea.getAssetAsBlob",
   *             "sea.getRawAsset",
   *             "sea.sea.isSea",
   *             "sea.sea.getAsset",
   *             "sea.sea.getAssetAsBlob",
   *             "sea.sea.getRawAsset",
   *             "stream",
   *             "stream.promises",
   *             "stream.promises.pipeline",
   *             "stream.promises.finished",
   *             "stream.finished",
   *             "stream.pipeline",
   *             "stream.compose",
   *             "stream.duplexPair",
   *             "stream.Readable",
   *             "stream.Readable.from",
   *             "stream.Readable.isDisturbed",
   *             "stream.Readable.fromWeb",
   *             "stream.Readable.toWeb",
   *             "stream.Writable",
   *             "stream.Writable.fromWeb",
   *             "stream.Writable.toWeb",
   *             "stream.Duplex",
   *             "stream.Duplex.from",
   *             "stream.Duplex.fromWeb",
   *             "stream.Duplex.toWeb",
   *             "stream.Transform",
   *             "stream.isErrored",
   *             "stream.isReadable",
   *             "stream.addAbortSignal",
   *             "stream.getDefaultHighWaterMark",
   *             "stream.setDefaultHighWaterMark",
   *             "stream/promises.pipeline",
   *             "stream/promises.finished",
   *             "stream/web",
   *             "stream/web.ReadableStream",
   *             "stream/web.ReadableStream.from",
   *             "stream/web.ReadableStreamDefaultReader",
   *             "stream/web.ReadableStreamBYOBReader",
   *             "stream/web.ReadableStreamDefaultController",
   *             "stream/web.ReadableByteStreamController",
   *             "stream/web.ReadableStreamBYOBRequest",
   *             "stream/web.WritableStream",
   *             "stream/web.WritableStreamDefaultWriter",
   *             "stream/web.WritableStreamDefaultController",
   *             "stream/web.TransformStream",
   *             "stream/web.TransformStreamDefaultController",
   *             "stream/web.ByteLengthQueuingStrategy",
   *             "stream/web.CountQueuingStrategy",
   *             "stream/web.TextEncoderStream",
   *             "stream/web.TextDecoderStream",
   *             "stream/web.CompressionStream",
   *             "stream/web.DecompressionStream",
   *             "stream/consumers",
   *             "stream/consumers.arrayBuffer",
   *             "stream/consumers.blob",
   *             "stream/consumers.buffer",
   *             "stream/consumers.json",
   *             "stream/consumers.text",
   *             "string_decoder",
   *             "string_decoder.StringDecoder",
   *             "sqlite",
   *             "sqlite.constants",
   *             "sqlite.constants.SQLITE_CHANGESET_OMIT",
   *             "sqlite.constants.SQLITE_CHANGESET_REPLACE",
   *             "sqlite.constants.SQLITE_CHANGESET_ABORT",
   *             "sqlite.backup",
   *             "sqlite.DatabaseSync",
   *             "sqlite.StatementSync",
   *             "sqlite.SQLITE_CHANGESET_OMIT",
   *             "sqlite.SQLITE_CHANGESET_REPLACE",
   *             "sqlite.SQLITE_CHANGESET_ABORT",
   *             "test",
   *             "test.after",
   *             "test.afterEach",
   *             "test.assert",
   *             "test.assert.register",
   *             "test.before",
   *             "test.beforeEach",
   *             "test.describe",
   *             "test.describe.only",
   *             "test.describe.skip",
   *             "test.describe.todo",
   *             "test.it",
   *             "test.it.only",
   *             "test.it.skip",
   *             "test.it.todo",
   *             "test.mock",
   *             "test.mock.fn",
   *             "test.mock.getter",
   *             "test.mock.method",
   *             "test.mock.module",
   *             "test.mock.reset",
   *             "test.mock.restoreAll",
   *             "test.mock.setter",
   *             "test.mock.timers",
   *             "test.mock.timers.enable",
   *             "test.mock.timers.reset",
   *             "test.mock.timers.tick",
   *             "test.only",
   *             "test.run",
   *             "test.snapshot",
   *             "test.snapshot.setDefaultSnapshotSerializers",
   *             "test.snapshot.setResolveSnapshotPath",
   *             "test.skip",
   *             "test.suite",
   *             "test.test",
   *             "test.test.only",
   *             "test.test.skip",
   *             "test.test.todo",
   *             "test.todo",
   *             "timers",
   *             "timers.Immediate",
   *             "timers.Timeout",
   *             "timers.setImmediate",
   *             "timers.clearImmediate",
   *             "timers.setInterval",
   *             "timers.clearInterval",
   *             "timers.setTimeout",
   *             "timers.clearTimeout",
   *             "timers.promises",
   *             "timers.promises.setTimeout",
   *             "timers.promises.setImmediate",
   *             "timers.promises.setInterval",
   *             "timers.promises.scheduler.wait",
   *             "timers.promises.scheduler.yield",
   *             "timers/promises",
   *             "timers/promises.setTimeout",
   *             "timers/promises.setImmediate",
   *             "timers/promises.setInterval",
   *             "timers/promises.scheduler.wait",
   *             "timers/promises.scheduler.yield",
   *             "tls",
   *             "tls.checkServerIdentity",
   *             "tls.connect",
   *             "tls.createSecureContext",
   *             "tls.createSecurePair",
   *             "tls.createServer",
   *             "tls.CryptoStream",
   *             "tls.DEFAULT_CIPHERS",
   *             "tls.DEFAULT_ECDH_CURVE",
   *             "tls.DEFAULT_MAX_VERSION",
   *             "tls.DEFAULT_MIN_VERSION",
   *             "tls.getCACertificates",
   *             "tls.getCiphers",
   *             "tls.rootCertificates",
   *             "tls.SecureContext",
   *             "tls.SecurePair",
   *             "tls.Server",
   *             "tls.setDefaultCACertificates",
   *             "tls.TLSSocket",
   *             "trace_events",
   *             "trace_events.createTracing",
   *             "trace_events.getEnabledCategories",
   *             "tty",
   *             "tty.isatty",
   *             "tty.ReadStream",
   *             "tty.WriteStream",
   *             "url",
   *             "url.domainToASCII",
   *             "url.domainToUnicode",
   *             "url.fileURLToPath",
   *             "url.format",
   *             "url.pathToFileURL",
   *             "url.urlToHttpOptions",
   *             "url.URL",
   *             "url.URL.canParse",
   *             "url.URL.createObjectURL",
   *             "url.URL.revokeObjectURL",
   *             "url.URLPattern",
   *             "url.URLSearchParams",
   *             "url.Url",
   *             "util.promisify",
   *             "util.promisify.custom",
   *             "util.callbackify",
   *             "util.debuglog",
   *             "util.debug",
   *             "util.deprecate",
   *             "util.diff",
   *             "util.format",
   *             "util.formatWithOptions",
   *             "util.getCallSite",
   *             "util.getCallSites",
   *             "util.getSystemErrorName",
   *             "util.getSystemErrorMap",
   *             "util.getSystemErrorMessage",
   *             "util.inherits",
   *             "util.inspect",
   *             "util.inspect.custom",
   *             "util.inspect.defaultOptions",
   *             "util.inspect.replDefaults",
   *             "util.isDeepStrictEqual",
   *             "util.parseArgs",
   *             "util.parseEnv",
   *             "util.setTraceSigInt",
   *             "util.stripVTControlCharacters",
   *             "util.styleText",
   *             "util.toUSVString",
   *             "util.transferableAbortController",
   *             "util.transferableAbortSignal",
   *             "util.aborted",
   *             "util.MIMEType",
   *             "util.MIMEParams",
   *             "util.TextDecoder",
   *             "util.TextEncoder",
   *             "util.types",
   *             "util.types.isExternal",
   *             "util.types.isDate",
   *             "util.types.isArgumentsObject",
   *             "util.types.isBigIntObject",
   *             "util.types.isBooleanObject",
   *             "util.types.isNumberObject",
   *             "util.types.isStringObject",
   *             "util.types.isSymbolObject",
   *             "util.types.isNativeError",
   *             "util.types.isRegExp",
   *             "util.types.isAsyncFunction",
   *             "util.types.isGeneratorFunction",
   *             "util.types.isGeneratorObject",
   *             "util.types.isPromise",
   *             "util.types.isMap",
   *             "util.types.isSet",
   *             "util.types.isMapIterator",
   *             "util.types.isSetIterator",
   *             "util.types.isWeakMap",
   *             "util.types.isWeakSet",
   *             "util.types.isArrayBuffer",
   *             "util.types.isDataView",
   *             "util.types.isSharedArrayBuffer",
   *             "util.types.isProxy",
   *             "util.types.isModuleNamespaceObject",
   *             "util.types.isAnyArrayBuffer",
   *             "util.types.isBoxedPrimitive",
   *             "util.types.isArrayBufferView",
   *             "util.types.isTypedArray",
   *             "util.types.isUint8Array",
   *             "util.types.isUint8ClampedArray",
   *             "util.types.isUint16Array",
   *             "util.types.isUint32Array",
   *             "util.types.isInt8Array",
   *             "util.types.isInt16Array",
   *             "util.types.isInt32Array",
   *             "util.types.isFloat16Array",
   *             "util.types.isFloat32Array",
   *             "util.types.isFloat64Array",
   *             "util.types.isBigInt64Array",
   *             "util.types.isBigUint64Array",
   *             "util.types.isKeyObject",
   *             "util.types.isCryptoKey",
   *             "util.types.isWebAssemblyCompiledModule",
   *             "util._extend",
   *             "util.isArray",
   *             "util.isBoolean",
   *             "util.isBuffer",
   *             "util.isDate",
   *             "util.isError",
   *             "util.isFunction",
   *             "util.isNull",
   *             "util.isNullOrUndefined",
   *             "util.isNumber",
   *             "util.isObject",
   *             "util.isPrimitive",
   *             "util.isRegExp",
   *             "util.isString",
   *             "util.isSymbol",
   *             "util.isUndefined",
   *             "util.log",
   *             "util",
   *             "util/types",
   *             "util/types.isExternal",
   *             "util/types.isDate",
   *             "util/types.isArgumentsObject",
   *             "util/types.isBigIntObject",
   *             "util/types.isBooleanObject",
   *             "util/types.isNumberObject",
   *             "util/types.isStringObject",
   *             "util/types.isSymbolObject",
   *             "util/types.isNativeError",
   *             "util/types.isRegExp",
   *             "util/types.isAsyncFunction",
   *             "util/types.isGeneratorFunction",
   *             "util/types.isGeneratorObject",
   *             "util/types.isPromise",
   *             "util/types.isMap",
   *             "util/types.isSet",
   *             "util/types.isMapIterator",
   *             "util/types.isSetIterator",
   *             "util/types.isWeakMap",
   *             "util/types.isWeakSet",
   *             "util/types.isArrayBuffer",
   *             "util/types.isDataView",
   *             "util/types.isSharedArrayBuffer",
   *             "util/types.isProxy",
   *             "util/types.isModuleNamespaceObject",
   *             "util/types.isAnyArrayBuffer",
   *             "util/types.isBoxedPrimitive",
   *             "util/types.isArrayBufferView",
   *             "util/types.isTypedArray",
   *             "util/types.isUint8Array",
   *             "util/types.isUint8ClampedArray",
   *             "util/types.isUint16Array",
   *             "util/types.isUint32Array",
   *             "util/types.isInt8Array",
   *             "util/types.isInt16Array",
   *             "util/types.isInt32Array",
   *             "util/types.isFloat16Array",
   *             "util/types.isFloat32Array",
   *             "util/types.isFloat64Array",
   *             "util/types.isBigInt64Array",
   *             "util/types.isBigUint64Array",
   *             "util/types.isKeyObject",
   *             "util/types.isCryptoKey",
   *             "util/types.isWebAssemblyCompiledModule",
   *             "v8",
   *             "v8.serialize",
   *             "v8.deserialize",
   *             "v8.Serializer",
   *             "v8.Deserializer",
   *             "v8.DefaultSerializer",
   *             "v8.DefaultDeserializer",
   *             "v8.promiseHooks",
   *             "v8.promiseHooks.onInit",
   *             "v8.promiseHooks.onSettled",
   *             "v8.promiseHooks.onBefore",
   *             "v8.promiseHooks.onAfter",
   *             "v8.promiseHooks.createHook",
   *             "v8.startupSnapshot",
   *             "v8.startupSnapshot.addSerializeCallback",
   *             "v8.startupSnapshot.addDeserializeCallback",
   *             "v8.startupSnapshot.setDeserializeMainFunction",
   *             "v8.startupSnapshot.isBuildingSnapshot",
   *             "v8.cachedDataVersionTag",
   *             "v8.getHeapCodeStatistics",
   *             "v8.getHeapSnapshot",
   *             "v8.getHeapSpaceStatistics",
   *             "v8.getHeapStatistics",
   *             "v8.isStringOneByteRepresentation",
   *             "v8.queryObjects",
   *             "v8.setFlagsFromString",
   *             "v8.stopCoverage",
   *             "v8.takeCoverage",
   *             "v8.writeHeapSnapshot",
   *             "v8.setHeapSnapshotNearHeapLimit",
   *             "v8.GCProfiler",
   *             "vm.constants",
   *             "vm.compileFunction",
   *             "vm.createContext",
   *             "vm.isContext",
   *             "vm.measureMemory",
   *             "vm.runInContext",
   *             "vm.runInNewContext",
   *             "vm.runInThisContext",
   *             "vm.Script",
   *             "vm.Module",
   *             "vm.SourceTextModule",
   *             "vm.SyntheticModule",
   *             "vm",
   *             "wasi.WASI",
   *             "wasi",
   *             "worker_threads",
   *             "worker_threads.parentPort",
   *             "worker_threads.resourceLimits",
   *             "worker_threads.SHARE_ENV",
   *             "worker_threads.threadId",
   *             "worker_threads.workerData",
   *             "worker_threads.getEnvironmentData",
   *             "worker_threads.getHeapStatistics",
   *             "worker_threads.markAsUncloneable",
   *             "worker_threads.markAsUntransferable",
   *             "worker_threads.isInternalThread",
   *             "worker_threads.isMainThread",
   *             "worker_threads.isMarkedAsUntransferable",
   *             "worker_threads.moveMessagePortToContext",
   *             "worker_threads.postMessageToThread",
   *             "worker_threads.receiveMessageOnPort",
   *             "worker_threads.setEnvironmentData",
   *             "worker_threads.BroadcastChannel",
   *             "worker_threads.MessageChannel",
   *             "worker_threads.MessagePort",
   *             "worker_threads.Worker",
   *             "zlib.brotliCompress",
   *             "zlib.brotliCompressSync",
   *             "zlib.brotliDecompress",
   *             "zlib.brotliDecompressSync",
   *             "zlib.constants",
   *             "zlib.constants.ZSTD_e_continue",
   *             "zlib.constants.ZSTD_e_flush",
   *             "zlib.constants.ZSTD_e_end",
   *             "zlib.constants.ZSTD_fast",
   *             "zlib.constants.ZSTD_dfast",
   *             "zlib.constants.ZSTD_greedy",
   *             "zlib.constants.ZSTD_lazy",
   *             "zlib.constants.ZSTD_lazy2",
   *             "zlib.constants.ZSTD_btlazy2",
   *             "zlib.constants.ZSTD_btopt",
   *             "zlib.constants.ZSTD_btultra",
   *             "zlib.constants.ZSTD_btultra2",
   *             "zlib.constants.ZSTD_c_compressionLevel",
   *             "zlib.constants.ZSTD_c_windowLog",
   *             "zlib.constants.ZSTD_c_hashLog",
   *             "zlib.constants.ZSTD_c_chainLog",
   *             "zlib.constants.ZSTD_c_searchLog",
   *             "zlib.constants.ZSTD_c_minMatch",
   *             "zlib.constants.ZSTD_c_targetLength",
   *             "zlib.constants.ZSTD_c_strategy",
   *             "zlib.constants.ZSTD_c_enableLongDistanceMatching",
   *             "zlib.constants.ZSTD_c_ldmHashLog",
   *             "zlib.constants.ZSTD_c_ldmMinMatch",
   *             "zlib.constants.ZSTD_c_ldmBucketSizeLog",
   *             "zlib.constants.ZSTD_c_ldmHashRateLog",
   *             "zlib.constants.ZSTD_c_contentSizeFlag",
   *             "zlib.constants.ZSTD_c_checksumFlag",
   *             "zlib.constants.ZSTD_c_dictIDFlag",
   *             "zlib.constants.ZSTD_c_nbWorkers",
   *             "zlib.constants.ZSTD_c_jobSize",
   *             "zlib.constants.ZSTD_c_overlapLog",
   *             "zlib.constants.ZSTD_d_windowLogMax",
   *             "zlib.constants.ZSTD_CLEVEL_DEFAULT",
   *             "zlib.constants.ZSTD_error_no_error",
   *             "zlib.constants.ZSTD_error_GENERIC",
   *             "zlib.constants.ZSTD_error_prefix_unknown",
   *             "zlib.constants.ZSTD_error_version_unsupported",
   *             "zlib.constants.ZSTD_error_frameParameter_unsupported",
   *             "zlib.constants.ZSTD_error_frameParameter_windowTooLarge",
   *             "zlib.constants.ZSTD_error_corruption_detected",
   *             "zlib.constants.ZSTD_error_checksum_wrong",
   *             "zlib.constants.ZSTD_error_literals_headerWrong",
   *             "zlib.constants.ZSTD_error_dictionary_corrupted",
   *             "zlib.constants.ZSTD_error_dictionary_wrong",
   *             "zlib.constants.ZSTD_error_dictionaryCreation_failed",
   *             "zlib.constants.ZSTD_error_parameter_unsupported",
   *             "zlib.constants.ZSTD_error_parameter_combination_unsupported",
   *             "zlib.constants.ZSTD_error_parameter_outOfBound",
   *             "zlib.constants.ZSTD_error_tableLog_tooLarge",
   *             "zlib.constants.ZSTD_error_maxSymbolValue_tooLarge",
   *             "zlib.constants.ZSTD_error_maxSymbolValue_tooSmall",
   *             "zlib.constants.ZSTD_error_stabilityCondition_notRespected",
   *             "zlib.constants.ZSTD_error_stage_wrong",
   *             "zlib.constants.ZSTD_error_init_missing",
   *             "zlib.constants.ZSTD_error_memory_allocation",
   *             "zlib.constants.ZSTD_error_workSpace_tooSmall",
   *             "zlib.constants.ZSTD_error_dstSize_tooSmall",
   *             "zlib.constants.ZSTD_error_srcSize_wrong",
   *             "zlib.constants.ZSTD_error_dstBuffer_null",
   *             "zlib.constants.ZSTD_error_noForwardProgress_destFull",
   *             "zlib.constants.ZSTD_error_noForwardProgress_inputEmpty",
   *             "zlib.crc32",
   *             "zlib.createBrotliCompress",
   *             "zlib.createBrotliDecompress",
   *             "zlib.createDeflate",
   *             "zlib.createDeflateRaw",
   *             "zlib.createGunzip",
   *             "zlib.createGzip",
   *             "zlib.createInflate",
   *             "zlib.createInflateRaw",
   *             "zlib.createUnzip",
   *             "zlib.createZstdCompress",
   *             "zlib.createZstdDecompress",
   *             "zlib.deflate",
   *             "zlib.deflateRaw",
   *             "zlib.deflateRawSync",
   *             "zlib.deflateSync",
   *             "zlib.gunzip",
   *             "zlib.gunzipSync",
   *             "zlib.gzip",
   *             "zlib.gzipSync",
   *             "zlib.inflate",
   *             "zlib.inflateRaw",
   *             "zlib.inflateRawSync",
   *             "zlib.inflateSync",
   *             "zlib.unzip",
   *             "zlib.unzipSync",
   *             "zlib.zstdCompress",
   *             "zlib.zstdCompressSync",
   *             "zlib.zstdDecompress",
   *             "zlib.zstdDecompressSync",
   *             "zlib.BrotliCompress()",
   *             "zlib.BrotliCompress",
   *             "zlib.BrotliDecompress()",
   *             "zlib.BrotliDecompress",
   *             "zlib.Deflate()",
   *             "zlib.Deflate",
   *             "zlib.DeflateRaw()",
   *             "zlib.DeflateRaw",
   *             "zlib.Gunzip()",
   *             "zlib.Gunzip",
   *             "zlib.Gzip()",
   *             "zlib.Gzip",
   *             "zlib.Inflate()",
   *             "zlib.Inflate",
   *             "zlib.InflateRaw()",
   *             "zlib.InflateRaw",
   *             "zlib.Unzip()",
   *             "zlib.Unzip",
   *             "zlib.ZstdCompress",
   *             "zlib.ZstdDecompress",
   *             "zlib.ZstdOptions",
   *             "zlib",
   *             "import.meta.resolve",
   *             "import.meta.dirname",
   *             "import.meta.filename",
   *             "import.meta.main"
   *           ]
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
    version?: string;
    allowExperimental?: boolean;
    ignores?: readonly (
      | '__filename'
      | '__dirname'
      | 'require'
      | 'require.cache'
      | 'require.extensions'
      | 'require.main'
      | 'require.resolve'
      | 'require.resolve.paths'
      | 'module'
      | 'module.children'
      | 'module.exports'
      | 'module.filename'
      | 'module.id'
      | 'module.isPreloading'
      | 'module.loaded'
      | 'module.parent'
      | 'module.path'
      | 'module.paths'
      | 'module.require'
      | 'exports'
      | 'AbortController'
      | 'AbortSignal'
      | 'AbortSignal.abort'
      | 'AbortSignal.timeout'
      | 'AbortSignal.any'
      | 'DOMException'
      | 'FormData'
      | 'Headers'
      | 'MessageEvent'
      | 'Navigator'
      | 'Request'
      | 'Response'
      | 'WebAssembly'
      | 'WebSocket'
      | 'fetch'
      | 'global'
      | 'queueMicrotask'
      | 'navigator'
      | 'navigator.hardwareConcurrency'
      | 'navigator.language'
      | 'navigator.languages'
      | 'navigator.platform'
      | 'navigator.userAgent'
      | 'structuredClone'
      | 'localStorage'
      | 'sessionStorage'
      | 'Storage'
      | 'Blob'
      | 'new Buffer()'
      | 'Buffer'
      | 'Buffer.alloc'
      | 'Buffer.allocUnsafe'
      | 'Buffer.allocUnsafeSlow'
      | 'Buffer.byteLength'
      | 'Buffer.compare'
      | 'Buffer.concat'
      | 'Buffer.copyBytesFrom'
      | 'Buffer.from'
      | 'Buffer.isBuffer'
      | 'Buffer.isEncoding'
      | 'File'
      | 'atob'
      | 'btoa'
      | 'console'
      | 'console.profile'
      | 'console.profileEnd'
      | 'console.timeStamp'
      | 'console.Console'
      | 'console.assert'
      | 'console.clear'
      | 'console.count'
      | 'console.countReset'
      | 'console.debug'
      | 'console.dir'
      | 'console.dirxml'
      | 'console.error'
      | 'console.group'
      | 'console.groupCollapsed'
      | 'console.groupEnd'
      | 'console.info'
      | 'console.log'
      | 'console.table'
      | 'console.time'
      | 'console.timeEnd'
      | 'console.timeLog'
      | 'console.trace'
      | 'console.warn'
      | 'crypto'
      | 'crypto.subtle'
      | 'crypto.subtle.decrypt'
      | 'crypto.subtle.deriveBits'
      | 'crypto.subtle.deriveKey'
      | 'crypto.subtle.digest'
      | 'crypto.subtle.encrypt'
      | 'crypto.subtle.exportKey'
      | 'crypto.subtle.generateKey'
      | 'crypto.subtle.importKey'
      | 'crypto.subtle.sign'
      | 'crypto.subtle.unwrapKey'
      | 'crypto.subtle.verify'
      | 'crypto.subtle.wrapKey'
      | 'crypto.getRandomValues'
      | 'crypto.randomUUID'
      | 'Crypto'
      | 'CryptoKey'
      | 'SubtleCrypto'
      | 'CloseEvent'
      | 'CustomEvent'
      | 'Event'
      | 'EventSource'
      | 'EventTarget'
      | 'PerformanceEntry'
      | 'PerformanceMark'
      | 'PerformanceMeasure'
      | 'PerformanceObserver'
      | 'PerformanceObserverEntryList'
      | 'PerformanceResourceTiming'
      | 'performance'
      | 'performance.clearMarks'
      | 'performance.clearMeasures'
      | 'performance.clearResourceTimings'
      | 'performance.eventLoopUtilization'
      | 'performance.getEntries'
      | 'performance.getEntriesByName'
      | 'performance.getEntriesByType'
      | 'performance.mark'
      | 'performance.markResourceTiming'
      | 'performance.measure'
      | 'performance.nodeTiming'
      | 'performance.nodeTiming.bootstrapComplete'
      | 'performance.nodeTiming.environment'
      | 'performance.nodeTiming.idleTime'
      | 'performance.nodeTiming.loopExit'
      | 'performance.nodeTiming.loopStart'
      | 'performance.nodeTiming.nodeStart'
      | 'performance.nodeTiming.uvMetricsInfo'
      | 'performance.nodeTiming.v8Start'
      | 'performance.now'
      | 'performance.onresourcetimingbufferfull'
      | 'performance.setResourceTimingBufferSize'
      | 'performance.timeOrigin'
      | 'performance.timerify'
      | 'performance.toJSON'
      | 'process'
      | 'process.allowedNodeEnvironmentFlags'
      | 'process.availableMemory'
      | 'process.arch'
      | 'process.argv'
      | 'process.argv0'
      | 'process.channel'
      | 'process.config'
      | 'process.connected'
      | 'process.debugPort'
      | 'process.env'
      | 'process.execArgv'
      | 'process.execPath'
      | 'process.execve'
      | 'process.exitCode'
      | 'process.features.cached_builtins'
      | 'process.features.debug'
      | 'process.features.inspector'
      | 'process.features.ipv6'
      | 'process.features.require_module'
      | 'process.features.tls'
      | 'process.features.tls_alpn'
      | 'process.features.tls_ocsp'
      | 'process.features.tls_sni'
      | 'process.features.typescript'
      | 'process.features.uv'
      | 'process.finalization.register'
      | 'process.finalization.registerBeforeExit'
      | 'process.finalization.unregister'
      | 'process.getBuiltinModule'
      | 'process.mainModule'
      | 'process.noDeprecation'
      | 'process.permission'
      | 'process.pid'
      | 'process.platform'
      | 'process.ppid'
      | 'process.ref'
      | 'process.release'
      | 'process.report'
      | 'process.report.excludeEnv'
      | 'process.sourceMapsEnabled'
      | 'process.stdin'
      | 'process.stdin.isRaw'
      | 'process.stdin.isTTY'
      | 'process.stdin.setRawMode'
      | 'process.stdout'
      | 'process.stdout.clearLine'
      | 'process.stdout.clearScreenDown'
      | 'process.stdout.columns'
      | 'process.stdout.cursorTo'
      | 'process.stdout.getColorDepth'
      | 'process.stdout.getWindowSize'
      | 'process.stdout.hasColors'
      | 'process.stdout.isTTY'
      | 'process.stdout.moveCursor'
      | 'process.stdout.rows'
      | 'process.stderr'
      | 'process.stderr.clearLine'
      | 'process.stderr.clearScreenDown'
      | 'process.stderr.columns'
      | 'process.stderr.cursorTo'
      | 'process.stderr.getColorDepth'
      | 'process.stderr.getWindowSize'
      | 'process.stderr.hasColors'
      | 'process.stderr.isTTY'
      | 'process.stderr.moveCursor'
      | 'process.stderr.rows'
      | 'process.threadCpuUsage'
      | 'process.throwDeprecation'
      | 'process.title'
      | 'process.traceDeprecation'
      | 'process.version'
      | 'process.versions'
      | 'process.abort'
      | 'process.chdir'
      | 'process.constrainedMemory'
      | 'process.cpuUsage'
      | 'process.cwd'
      | 'process.disconnect'
      | 'process.dlopen'
      | 'process.emitWarning'
      | 'process.exit'
      | 'process.getActiveResourcesInfo'
      | 'process.getegid'
      | 'process.geteuid'
      | 'process.getgid'
      | 'process.getgroups'
      | 'process.getuid'
      | 'process.hasUncaughtExceptionCaptureCallback'
      | 'process.hrtime'
      | 'process.hrtime.bigint'
      | 'process.initgroups'
      | 'process.kill'
      | 'process.loadEnvFile'
      | 'process.memoryUsage'
      | 'process.rss'
      | 'process.nextTick'
      | 'process.resourceUsage'
      | 'process.send'
      | 'process.setegid'
      | 'process.seteuid'
      | 'process.setgid'
      | 'process.setgroups'
      | 'process.setuid'
      | 'process.setSourceMapsEnabled'
      | 'process.setUncaughtExceptionCaptureCallback'
      | 'process.umask'
      | 'process.unref'
      | 'process.uptime'
      | 'ReadableStream'
      | 'ReadableStream.from'
      | 'ReadableStreamDefaultReader'
      | 'ReadableStreamBYOBReader'
      | 'ReadableStreamDefaultController'
      | 'ReadableByteStreamController'
      | 'ReadableStreamBYOBRequest'
      | 'WritableStream'
      | 'WritableStreamDefaultWriter'
      | 'WritableStreamDefaultController'
      | 'TransformStream'
      | 'TransformStreamDefaultController'
      | 'ByteLengthQueuingStrategy'
      | 'CountQueuingStrategy'
      | 'TextEncoderStream'
      | 'TextDecoderStream'
      | 'CompressionStream'
      | 'DecompressionStream'
      | 'setInterval'
      | 'clearInterval'
      | 'setTimeout'
      | 'clearTimeout'
      | 'setImmediate'
      | 'clearImmediate'
      | 'URL'
      | 'URL.canParse'
      | 'URL.createObjectURL'
      | 'URL.revokeObjectURL'
      | 'URLSearchParams'
      | 'TextDecoder'
      | 'TextEncoder'
      | 'BroadcastChannel'
      | 'MessageChannel'
      | 'MessagePort'
      | 'assert'
      | 'assert.Assert'
      | 'assert.assert'
      | 'assert.deepEqual'
      | 'assert.deepStrictEqual'
      | 'assert.doesNotMatch'
      | 'assert.doesNotReject'
      | 'assert.doesNotThrow'
      | 'assert.equal'
      | 'assert.fail'
      | 'assert.ifError'
      | 'assert.match'
      | 'assert.notDeepEqual'
      | 'assert.notDeepStrictEqual'
      | 'assert.notEqual'
      | 'assert.notStrictEqual'
      | 'assert.ok'
      | 'assert.partialDeepStrictEqual'
      | 'assert.rejects'
      | 'assert.strictEqual'
      | 'assert.throws'
      | 'assert.CallTracker'
      | 'assert.strict'
      | 'assert.strict.Assert'
      | 'assert.strict.assert'
      | 'assert.strict.deepEqual'
      | 'assert.strict.deepStrictEqual'
      | 'assert.strict.doesNotMatch'
      | 'assert.strict.doesNotReject'
      | 'assert.strict.doesNotThrow'
      | 'assert.strict.equal'
      | 'assert.strict.fail'
      | 'assert.strict.ifError'
      | 'assert.strict.match'
      | 'assert.strict.notDeepEqual'
      | 'assert.strict.notDeepStrictEqual'
      | 'assert.strict.notEqual'
      | 'assert.strict.notStrictEqual'
      | 'assert.strict.ok'
      | 'assert.strict.partialDeepStrictEqual'
      | 'assert.strict.rejects'
      | 'assert.strict.strictEqual'
      | 'assert.strict.throws'
      | 'assert.strict.CallTracker'
      | 'assert/strict'
      | 'assert/strict.Assert'
      | 'assert/strict.assert'
      | 'assert/strict.deepEqual'
      | 'assert/strict.deepStrictEqual'
      | 'assert/strict.doesNotMatch'
      | 'assert/strict.doesNotReject'
      | 'assert/strict.doesNotThrow'
      | 'assert/strict.equal'
      | 'assert/strict.fail'
      | 'assert/strict.ifError'
      | 'assert/strict.match'
      | 'assert/strict.notDeepEqual'
      | 'assert/strict.notDeepStrictEqual'
      | 'assert/strict.notEqual'
      | 'assert/strict.notStrictEqual'
      | 'assert/strict.ok'
      | 'assert/strict.partialDeepStrictEqual'
      | 'assert/strict.rejects'
      | 'assert/strict.strictEqual'
      | 'assert/strict.throws'
      | 'assert/strict.CallTracker'
      | 'async_hooks'
      | 'async_hooks.createHook'
      | 'async_hooks.executionAsyncResource'
      | 'async_hooks.executionAsyncId'
      | 'async_hooks.triggerAsyncId'
      | 'async_hooks.AsyncLocalStorage'
      | 'async_hooks.AsyncLocalStorage.bind'
      | 'async_hooks.AsyncLocalStorage.snapshot'
      | 'async_hooks.AsyncResource'
      | 'async_hooks.AsyncResource.bind'
      | 'buffer'
      | 'buffer.constants'
      | 'buffer.INSPECT_MAX_BYTES'
      | 'buffer.kMaxLength'
      | 'buffer.kStringMaxLength'
      | 'buffer.atob'
      | 'buffer.btoa'
      | 'buffer.isAscii'
      | 'buffer.isUtf8'
      | 'buffer.resolveObjectURL'
      | 'buffer.transcode'
      | 'buffer.SlowBuffer'
      | 'buffer.Blob'
      | 'new buffer.Buffer()'
      | 'buffer.Buffer'
      | 'buffer.Buffer.alloc'
      | 'buffer.Buffer.allocUnsafe'
      | 'buffer.Buffer.allocUnsafeSlow'
      | 'buffer.Buffer.byteLength'
      | 'buffer.Buffer.compare'
      | 'buffer.Buffer.concat'
      | 'buffer.Buffer.copyBytesFrom'
      | 'buffer.Buffer.from'
      | 'buffer.Buffer.isBuffer'
      | 'buffer.Buffer.isEncoding'
      | 'buffer.File'
      | 'child_process'
      | 'child_process.exec'
      | 'child_process.execFile'
      | 'child_process.fork'
      | 'child_process.spawn'
      | 'child_process.execFileSync'
      | 'child_process.execSync'
      | 'child_process.spawnSync'
      | 'child_process.ChildProcess'
      | 'cluster'
      | 'cluster.isMaster'
      | 'cluster.isPrimary'
      | 'cluster.isWorker'
      | 'cluster.schedulingPolicy'
      | 'cluster.settings'
      | 'cluster.worker'
      | 'cluster.workers'
      | 'cluster.disconnect'
      | 'cluster.fork'
      | 'cluster.setupMaster'
      | 'cluster.setupPrimary'
      | 'cluster.Worker'
      | 'crypto.constants'
      | 'crypto.fips'
      | 'crypto.webcrypto'
      | 'crypto.webcrypto.subtle'
      | 'crypto.webcrypto.subtle.decrypt'
      | 'crypto.webcrypto.subtle.deriveBits'
      | 'crypto.webcrypto.subtle.deriveKey'
      | 'crypto.webcrypto.subtle.digest'
      | 'crypto.webcrypto.subtle.encrypt'
      | 'crypto.webcrypto.subtle.exportKey'
      | 'crypto.webcrypto.subtle.generateKey'
      | 'crypto.webcrypto.subtle.importKey'
      | 'crypto.webcrypto.subtle.sign'
      | 'crypto.webcrypto.subtle.unwrapKey'
      | 'crypto.webcrypto.subtle.verify'
      | 'crypto.webcrypto.subtle.wrapKey'
      | 'crypto.webcrypto.getRandomValues'
      | 'crypto.webcrypto.randomUUID'
      | 'crypto.checkPrime'
      | 'crypto.checkPrimeSync'
      | 'crypto.createCipher'
      | 'crypto.createCipheriv'
      | 'crypto.createDecipher'
      | 'crypto.createDecipheriv'
      | 'crypto.createDiffieHellman'
      | 'crypto.createDiffieHellmanGroup'
      | 'crypto.createECDH'
      | 'crypto.createHash'
      | 'crypto.createHmac'
      | 'crypto.createPrivateKey'
      | 'crypto.createPublicKey'
      | 'crypto.createSecretKey'
      | 'crypto.createSign'
      | 'crypto.createVerify'
      | 'crypto.diffieHellman'
      | 'crypto.generateKey'
      | 'crypto.generateKeyPair'
      | 'crypto.generateKeyPairSync'
      | 'crypto.generateKeySync'
      | 'crypto.generatePrime'
      | 'crypto.generatePrimeSync'
      | 'crypto.getCipherInfo'
      | 'crypto.getCiphers'
      | 'crypto.getCurves'
      | 'crypto.getDiffieHellman'
      | 'crypto.getFips'
      | 'crypto.getHashes'
      | 'crypto.hash'
      | 'crypto.hkdf'
      | 'crypto.hkdfSync'
      | 'crypto.pbkdf2'
      | 'crypto.pbkdf2Sync'
      | 'crypto.privateDecrypt'
      | 'crypto.privateEncrypt'
      | 'crypto.publicDecrypt'
      | 'crypto.publicEncrypt'
      | 'crypto.randomBytes'
      | 'crypto.randomFillSync'
      | 'crypto.randomFill'
      | 'crypto.randomInt'
      | 'crypto.scrypt'
      | 'crypto.scryptSync'
      | 'crypto.secureHeapUsed'
      | 'crypto.setEngine'
      | 'crypto.setFips'
      | 'crypto.sign'
      | 'crypto.timingSafeEqual'
      | 'crypto.verify'
      | 'crypto.Certificate'
      | 'crypto.Certificate.exportChallenge'
      | 'crypto.Certificate.exportPublicKey'
      | 'crypto.Certificate.verifySpkac'
      | 'crypto.Cipher'
      | 'crypto.Decipher'
      | 'crypto.DiffieHellman'
      | 'crypto.DiffieHellmanGroup'
      | 'crypto.ECDH'
      | 'crypto.ECDH.convertKey'
      | 'crypto.Hash()'
      | 'new crypto.Hash()'
      | 'crypto.Hash'
      | 'crypto.Hmac()'
      | 'new crypto.Hmac()'
      | 'crypto.Hmac'
      | 'crypto.KeyObject'
      | 'crypto.KeyObject.from'
      | 'crypto.Sign'
      | 'crypto.Verify'
      | 'crypto.X509Certificate'
      | 'dgram'
      | 'dgram.createSocket'
      | 'dgram.Socket'
      | 'diagnostics_channel'
      | 'diagnostics_channel.hasSubscribers'
      | 'diagnostics_channel.channel'
      | 'diagnostics_channel.subscribe'
      | 'diagnostics_channel.unsubscribe'
      | 'diagnostics_channel.tracingChannel'
      | 'diagnostics_channel.Channel'
      | 'diagnostics_channel.TracingChannel'
      | 'dns'
      | 'dns.Resolver'
      | 'dns.getServers'
      | 'dns.lookup'
      | 'dns.lookupService'
      | 'dns.resolve'
      | 'dns.resolve4'
      | 'dns.resolve6'
      | 'dns.resolveAny'
      | 'dns.resolveCname'
      | 'dns.resolveCaa'
      | 'dns.resolveMx'
      | 'dns.resolveNaptr'
      | 'dns.resolveNs'
      | 'dns.resolvePtr'
      | 'dns.resolveSoa'
      | 'dns.resolveSrv'
      | 'dns.resolveTlsa'
      | 'dns.resolveTxt'
      | 'dns.reverse'
      | 'dns.setDefaultResultOrder'
      | 'dns.getDefaultResultOrder'
      | 'dns.setServers'
      | 'dns.promises'
      | 'dns.promises.Resolver'
      | 'dns.promises.cancel'
      | 'dns.promises.getServers'
      | 'dns.promises.lookup'
      | 'dns.promises.lookupService'
      | 'dns.promises.resolve'
      | 'dns.promises.resolve4'
      | 'dns.promises.resolve6'
      | 'dns.promises.resolveAny'
      | 'dns.promises.resolveCaa'
      | 'dns.promises.resolveCname'
      | 'dns.promises.resolveMx'
      | 'dns.promises.resolveNaptr'
      | 'dns.promises.resolveNs'
      | 'dns.promises.resolvePtr'
      | 'dns.promises.resolveSoa'
      | 'dns.promises.resolveSrv'
      | 'dns.promises.resolveTlsa'
      | 'dns.promises.resolveTxt'
      | 'dns.promises.reverse'
      | 'dns.promises.setDefaultResultOrder'
      | 'dns.promises.getDefaultResultOrder'
      | 'dns.promises.setServers'
      | 'dns/promises'
      | 'dns/promises.Resolver'
      | 'dns/promises.cancel'
      | 'dns/promises.getServers'
      | 'dns/promises.lookup'
      | 'dns/promises.lookupService'
      | 'dns/promises.resolve'
      | 'dns/promises.resolve4'
      | 'dns/promises.resolve6'
      | 'dns/promises.resolveAny'
      | 'dns/promises.resolveCaa'
      | 'dns/promises.resolveCname'
      | 'dns/promises.resolveMx'
      | 'dns/promises.resolveNaptr'
      | 'dns/promises.resolveNs'
      | 'dns/promises.resolvePtr'
      | 'dns/promises.resolveSoa'
      | 'dns/promises.resolveSrv'
      | 'dns/promises.resolveTlsa'
      | 'dns/promises.resolveTxt'
      | 'dns/promises.reverse'
      | 'dns/promises.setDefaultResultOrder'
      | 'dns/promises.getDefaultResultOrder'
      | 'dns/promises.setServers'
      | 'domain'
      | 'domain.create'
      | 'domain.Domain'
      | 'events'
      | 'events.Event'
      | 'events.EventTarget'
      | 'events.CustomEvent'
      | 'events.NodeEventTarget'
      | 'events.EventEmitter'
      | 'events.EventEmitter.defaultMaxListeners'
      | 'events.EventEmitter.errorMonitor'
      | 'events.EventEmitter.captureRejections'
      | 'events.EventEmitter.captureRejectionSymbol'
      | 'events.EventEmitter.getEventListeners'
      | 'events.EventEmitter.getMaxListeners'
      | 'events.EventEmitter.once'
      | 'events.EventEmitter.listenerCount'
      | 'events.EventEmitter.on'
      | 'events.EventEmitter.setMaxListeners'
      | 'events.EventEmitter.addAbortListener'
      | 'events.EventEmitterAsyncResource'
      | 'events.EventEmitterAsyncResource.defaultMaxListeners'
      | 'events.EventEmitterAsyncResource.errorMonitor'
      | 'events.EventEmitterAsyncResource.captureRejections'
      | 'events.EventEmitterAsyncResource.captureRejectionSymbol'
      | 'events.EventEmitterAsyncResource.getEventListeners'
      | 'events.EventEmitterAsyncResource.getMaxListeners'
      | 'events.EventEmitterAsyncResource.once'
      | 'events.EventEmitterAsyncResource.listenerCount'
      | 'events.EventEmitterAsyncResource.on'
      | 'events.EventEmitterAsyncResource.setMaxListeners'
      | 'events.EventEmitterAsyncResource.addAbortListener'
      | 'events.defaultMaxListeners'
      | 'events.errorMonitor'
      | 'events.captureRejections'
      | 'events.captureRejectionSymbol'
      | 'events.getEventListeners'
      | 'events.getMaxListeners'
      | 'events.once'
      | 'events.listenerCount'
      | 'events.on'
      | 'events.setMaxListeners'
      | 'events.addAbortListener'
      | 'fs'
      | 'fs.promises'
      | 'fs.promises.FileHandle'
      | 'fs.promises.access'
      | 'fs.promises.appendFile'
      | 'fs.promises.chmod'
      | 'fs.promises.chown'
      | 'fs.promises.constants'
      | 'fs.promises.copyFile'
      | 'fs.promises.cp'
      | 'fs.promises.glob'
      | 'fs.promises.lchmod'
      | 'fs.promises.lchown'
      | 'fs.promises.link'
      | 'fs.promises.lstat'
      | 'fs.promises.lutimes'
      | 'fs.promises.mkdir'
      | 'fs.promises.mkdtemp'
      | 'fs.promises.open'
      | 'fs.promises.opendir'
      | 'fs.promises.readFile'
      | 'fs.promises.readdir'
      | 'fs.promises.readlink'
      | 'fs.promises.realpath'
      | 'fs.promises.rename'
      | 'fs.promises.rm'
      | 'fs.promises.rmdir'
      | 'fs.promises.stat'
      | 'fs.promises.statfs'
      | 'fs.promises.symlink'
      | 'fs.promises.truncate'
      | 'fs.promises.unlink'
      | 'fs.promises.utimes'
      | 'fs.promises.watch'
      | 'fs.promises.writeFile'
      | 'fs.access'
      | 'fs.appendFile'
      | 'fs.chmod'
      | 'fs.chown'
      | 'fs.close'
      | 'fs.copyFile'
      | 'fs.cp'
      | 'fs.createReadStream'
      | 'fs.createWriteStream'
      | 'fs.exists'
      | 'fs.fchmod'
      | 'fs.fchown'
      | 'fs.fdatasync'
      | 'fs.fstat'
      | 'fs.fsync'
      | 'fs.ftruncate'
      | 'fs.futimes'
      | 'fs.glob'
      | 'fs.lchmod'
      | 'fs.lchown'
      | 'fs.link'
      | 'fs.lstat'
      | 'fs.lutimes'
      | 'fs.mkdir'
      | 'fs.mkdtemp'
      | 'fs.native'
      | 'fs.open'
      | 'fs.openAsBlob'
      | 'fs.opendir'
      | 'fs.read'
      | 'fs.readdir'
      | 'fs.readFile'
      | 'fs.readlink'
      | 'fs.readv'
      | 'fs.realpath'
      | 'fs.realpath.native'
      | 'fs.rename'
      | 'fs.rm'
      | 'fs.rmdir'
      | 'fs.stat'
      | 'fs.statfs'
      | 'fs.symlink'
      | 'fs.truncate'
      | 'fs.unlink'
      | 'fs.unwatchFile'
      | 'fs.utimes'
      | 'fs.watch'
      | 'fs.watchFile'
      | 'fs.write'
      | 'fs.writeFile'
      | 'fs.writev'
      | 'fs.accessSync'
      | 'fs.appendFileSync'
      | 'fs.chmodSync'
      | 'fs.chownSync'
      | 'fs.closeSync'
      | 'fs.copyFileSync'
      | 'fs.cpSync'
      | 'fs.existsSync'
      | 'fs.fchmodSync'
      | 'fs.fchownSync'
      | 'fs.fdatasyncSync'
      | 'fs.fstatSync'
      | 'fs.fsyncSync'
      | 'fs.ftruncateSync'
      | 'fs.futimesSync'
      | 'fs.globSync'
      | 'fs.lchmodSync'
      | 'fs.lchownSync'
      | 'fs.linkSync'
      | 'fs.lstatSync'
      | 'fs.lutimesSync'
      | 'fs.mkdirSync'
      | 'fs.mkdtempSync'
      | 'fs.opendirSync'
      | 'fs.openSync'
      | 'fs.readdirSync'
      | 'fs.readFileSync'
      | 'fs.readlinkSync'
      | 'fs.readSync'
      | 'fs.readvSync'
      | 'fs.realpathSync'
      | 'fs.realpathSync.native'
      | 'fs.renameSync'
      | 'fs.rmdirSync'
      | 'fs.rmSync'
      | 'fs.statfsSync'
      | 'fs.statSync'
      | 'fs.symlinkSync'
      | 'fs.truncateSync'
      | 'fs.unlinkSync'
      | 'fs.utimesSync'
      | 'fs.writeFileSync'
      | 'fs.writeSync'
      | 'fs.writevSync'
      | 'fs.constants'
      | 'fs.Dir'
      | 'fs.Dirent'
      | 'fs.FSWatcher'
      | 'fs.StatWatcher'
      | 'fs.ReadStream'
      | 'fs.Stats()'
      | 'new fs.Stats()'
      | 'fs.Stats'
      | 'fs.StatFs'
      | 'fs.WriteStream'
      | 'fs.common_objects'
      | 'fs/promises'
      | 'fs/promises.FileHandle'
      | 'fs/promises.access'
      | 'fs/promises.appendFile'
      | 'fs/promises.chmod'
      | 'fs/promises.chown'
      | 'fs/promises.constants'
      | 'fs/promises.copyFile'
      | 'fs/promises.cp'
      | 'fs/promises.glob'
      | 'fs/promises.lchmod'
      | 'fs/promises.lchown'
      | 'fs/promises.link'
      | 'fs/promises.lstat'
      | 'fs/promises.lutimes'
      | 'fs/promises.mkdir'
      | 'fs/promises.mkdtemp'
      | 'fs/promises.open'
      | 'fs/promises.opendir'
      | 'fs/promises.readFile'
      | 'fs/promises.readdir'
      | 'fs/promises.readlink'
      | 'fs/promises.realpath'
      | 'fs/promises.rename'
      | 'fs/promises.rm'
      | 'fs/promises.rmdir'
      | 'fs/promises.stat'
      | 'fs/promises.statfs'
      | 'fs/promises.symlink'
      | 'fs/promises.truncate'
      | 'fs/promises.unlink'
      | 'fs/promises.utimes'
      | 'fs/promises.watch'
      | 'fs/promises.writeFile'
      | 'http2'
      | 'http2.constants'
      | 'http2.sensitiveHeaders'
      | 'http2.createServer'
      | 'http2.createSecureServer'
      | 'http2.connect'
      | 'http2.getDefaultSettings'
      | 'http2.getPackedSettings'
      | 'http2.getUnpackedSettings'
      | 'http2.performServerHandshake'
      | 'http2.Http2Session'
      | 'http2.ServerHttp2Session'
      | 'http2.ClientHttp2Session'
      | 'http2.Http2Stream'
      | 'http2.ClientHttp2Stream'
      | 'http2.ServerHttp2Stream'
      | 'http2.Http2Server'
      | 'http2.Http2SecureServer'
      | 'http2.Http2ServerRequest'
      | 'http2.Http2ServerResponse'
      | 'http'
      | 'http.METHODS'
      | 'http.STATUS_CODES'
      | 'http.globalAgent'
      | 'http.maxHeaderSize'
      | 'http.createServer'
      | 'http.get'
      | 'http.request'
      | 'http.validateHeaderName'
      | 'http.validateHeaderValue'
      | 'http.setMaxIdleHTTPParsers'
      | 'http.Agent'
      | 'http.ClientRequest'
      | 'http.Server'
      | 'http.ServerResponse'
      | 'http.IncomingMessage'
      | 'http.OutgoingMessage'
      | 'http.WebSocket'
      | '_http_agent'
      | '_http_client'
      | '_http_common'
      | '_http_incoming'
      | '_http_outgoing'
      | '_http_server'
      | 'https'
      | 'https.globalAgent'
      | 'https.createServer'
      | 'https.get'
      | 'https.request'
      | 'https.Agent'
      | 'https.Server'
      | 'inspector'
      | 'inspector.Session'
      | 'inspector.Network.dataReceived'
      | 'inspector.Network.dataSent'
      | 'inspector.Network.loadingFailed'
      | 'inspector.Network.loadingFinished'
      | 'inspector.Network.requestWillBeSent'
      | 'inspector.Network.responseReceived'
      | 'inspector.NetworkResources.put'
      | 'inspector.console'
      | 'inspector.close'
      | 'inspector.open'
      | 'inspector.url'
      | 'inspector.waitForDebugger'
      | 'inspector/promises'
      | 'inspector/promises.Session'
      | 'inspector/promises.Network.dataReceived'
      | 'inspector/promises.Network.dataSent'
      | 'inspector/promises.Network.loadingFailed'
      | 'inspector/promises.Network.loadingFinished'
      | 'inspector/promises.Network.requestWillBeSent'
      | 'inspector/promises.Network.responseReceived'
      | 'inspector/promises.NetworkResources.put'
      | 'inspector/promises.console'
      | 'inspector/promises.close'
      | 'inspector/promises.open'
      | 'inspector/promises.url'
      | 'inspector/promises.waitForDebugger'
      | 'module.builtinModules'
      | 'module.constants.compileCacheStatus'
      | 'module.createRequire'
      | 'module.createRequireFromPath'
      | 'module.enableCompileCache'
      | 'module.findPackageJSON'
      | 'module.flushCompileCache'
      | 'module.getCompileCacheDir'
      | 'module.getSourceMapsSupport'
      | 'module.isBuiltin'
      | 'module.registerHooks'
      | 'module.register'
      | 'module.setSourceMapsSupport'
      | 'module.stripTypeScriptTypes'
      | 'module.syncBuiltinESMExports'
      | 'module.findSourceMap'
      | 'module.SourceMap'
      | 'module.Module.builtinModules'
      | 'module.Module.createRequire'
      | 'module.Module.createRequireFromPath'
      | 'module.Module.enableCompileCache'
      | 'module.Module.findPackageJSON'
      | 'module.Module.flushCompileCache'
      | 'module.Module.getCompileCacheDir'
      | 'module.Module.getSourceMapsSupport'
      | 'module.Module.isBuiltin'
      | 'module.Module.registerHooks'
      | 'module.Module.register'
      | 'module.Module.setSourceMapsSupport'
      | 'module.Module.stripTypeScriptTypes'
      | 'module.Module.syncBuiltinESMExports'
      | 'module.Module.findSourceMap'
      | 'module.Module.SourceMap'
      | 'net'
      | 'net.connect'
      | 'net.createConnection'
      | 'net.createServer'
      | 'net.getDefaultAutoSelectFamily'
      | 'net.setDefaultAutoSelectFamily'
      | 'net.getDefaultAutoSelectFamilyAttemptTimeout'
      | 'net.setDefaultAutoSelectFamilyAttemptTimeout'
      | 'net.isIP'
      | 'net.isIPv4'
      | 'net.isIPv6'
      | 'net.BlockList'
      | 'net.BlockList.isBlockList'
      | 'net.SocketAddress'
      | 'net.SocketAddress.parse'
      | 'net.Server'
      | 'net.Socket'
      | 'os'
      | 'os.EOL'
      | 'os.constants'
      | 'os.constants.priority'
      | 'os.devNull'
      | 'os.availableParallelism'
      | 'os.arch'
      | 'os.cpus'
      | 'os.endianness'
      | 'os.freemem'
      | 'os.getPriority'
      | 'os.homedir'
      | 'os.hostname'
      | 'os.loadavg'
      | 'os.machine'
      | 'os.networkInterfaces'
      | 'os.platform'
      | 'os.release'
      | 'os.setPriority'
      | 'os.tmpdir'
      | 'os.totalmem'
      | 'os.type'
      | 'os.uptime'
      | 'os.userInfo'
      | 'os.version'
      | 'path'
      | 'path.posix'
      | 'path.posix.delimiter'
      | 'path.posix.sep'
      | 'path.posix.basename'
      | 'path.posix.dirname'
      | 'path.posix.extname'
      | 'path.posix.format'
      | 'path.posix.matchesGlob'
      | 'path.posix.isAbsolute'
      | 'path.posix.join'
      | 'path.posix.normalize'
      | 'path.posix.parse'
      | 'path.posix.relative'
      | 'path.posix.resolve'
      | 'path.posix.toNamespacedPath'
      | 'path.win32'
      | 'path.win32.delimiter'
      | 'path.win32.sep'
      | 'path.win32.basename'
      | 'path.win32.dirname'
      | 'path.win32.extname'
      | 'path.win32.format'
      | 'path.win32.matchesGlob'
      | 'path.win32.isAbsolute'
      | 'path.win32.join'
      | 'path.win32.normalize'
      | 'path.win32.parse'
      | 'path.win32.relative'
      | 'path.win32.resolve'
      | 'path.win32.toNamespacedPath'
      | 'path.delimiter'
      | 'path.sep'
      | 'path.basename'
      | 'path.dirname'
      | 'path.extname'
      | 'path.format'
      | 'path.matchesGlob'
      | 'path.isAbsolute'
      | 'path.join'
      | 'path.normalize'
      | 'path.parse'
      | 'path.relative'
      | 'path.resolve'
      | 'path.toNamespacedPath'
      | 'path/posix'
      | 'path/posix.delimiter'
      | 'path/posix.sep'
      | 'path/posix.basename'
      | 'path/posix.dirname'
      | 'path/posix.extname'
      | 'path/posix.format'
      | 'path/posix.matchesGlob'
      | 'path/posix.isAbsolute'
      | 'path/posix.join'
      | 'path/posix.normalize'
      | 'path/posix.parse'
      | 'path/posix.relative'
      | 'path/posix.resolve'
      | 'path/posix.toNamespacedPath'
      | 'path/win32'
      | 'path/win32.delimiter'
      | 'path/win32.sep'
      | 'path/win32.basename'
      | 'path/win32.dirname'
      | 'path/win32.extname'
      | 'path/win32.format'
      | 'path/win32.matchesGlob'
      | 'path/win32.isAbsolute'
      | 'path/win32.join'
      | 'path/win32.normalize'
      | 'path/win32.parse'
      | 'path/win32.relative'
      | 'path/win32.resolve'
      | 'path/win32.toNamespacedPath'
      | 'perf_hooks'
      | 'perf_hooks.performance'
      | 'perf_hooks.performance.clearMarks'
      | 'perf_hooks.performance.clearMeasures'
      | 'perf_hooks.performance.clearResourceTimings'
      | 'perf_hooks.performance.eventLoopUtilization'
      | 'perf_hooks.performance.getEntries'
      | 'perf_hooks.performance.getEntriesByName'
      | 'perf_hooks.performance.getEntriesByType'
      | 'perf_hooks.performance.mark'
      | 'perf_hooks.performance.markResourceTiming'
      | 'perf_hooks.performance.measure'
      | 'perf_hooks.performance.nodeTiming'
      | 'perf_hooks.performance.nodeTiming.bootstrapComplete'
      | 'perf_hooks.performance.nodeTiming.environment'
      | 'perf_hooks.performance.nodeTiming.idleTime'
      | 'perf_hooks.performance.nodeTiming.loopExit'
      | 'perf_hooks.performance.nodeTiming.loopStart'
      | 'perf_hooks.performance.nodeTiming.nodeStart'
      | 'perf_hooks.performance.nodeTiming.uvMetricsInfo'
      | 'perf_hooks.performance.nodeTiming.v8Start'
      | 'perf_hooks.performance.now'
      | 'perf_hooks.performance.onresourcetimingbufferfull'
      | 'perf_hooks.performance.setResourceTimingBufferSize'
      | 'perf_hooks.performance.timeOrigin'
      | 'perf_hooks.performance.timerify'
      | 'perf_hooks.performance.toJSON'
      | 'perf_hooks.createHistogram'
      | 'perf_hooks.monitorEventLoopDelay'
      | 'perf_hooks.PerformanceEntry'
      | 'perf_hooks.PerformanceMark'
      | 'perf_hooks.PerformanceMeasure'
      | 'perf_hooks.PerformanceNodeEntry'
      | 'perf_hooks.PerformanceNodeTiming'
      | 'perf_hooks.PerformanceResourceTiming'
      | 'perf_hooks.PerformanceObserver'
      | 'perf_hooks.PerformanceObserverEntryList'
      | 'perf_hooks.Histogram'
      | 'perf_hooks.IntervalHistogram'
      | 'perf_hooks.RecordableHistogram'
      | 'punycode'
      | 'punycode.ucs2'
      | 'punycode.version'
      | 'punycode.decode'
      | 'punycode.encode'
      | 'punycode.toASCII'
      | 'punycode.toUnicode'
      | 'querystring'
      | 'querystring.decode'
      | 'querystring.encode'
      | 'querystring.escape'
      | 'querystring.parse'
      | 'querystring.stringify'
      | 'querystring.unescape'
      | 'readline'
      | 'readline.promises'
      | 'readline.promises.createInterface'
      | 'readline.promises.Interface'
      | 'readline.promises.Readline'
      | 'readline.clearLine'
      | 'readline.clearScreenDown'
      | 'readline.createInterface'
      | 'readline.cursorTo'
      | 'readline.moveCursor'
      | 'readline.Interface'
      | 'readline.emitKeypressEvents'
      | 'readline.InterfaceConstructor'
      | 'readline/promises'
      | 'readline/promises.createInterface'
      | 'readline/promises.Interface'
      | 'readline/promises.Readline'
      | 'repl'
      | 'repl.start'
      | 'repl.writer'
      | 'repl.REPLServer()'
      | 'repl.REPLServer'
      | 'repl.REPL_MODE_MAGIC'
      | 'repl.REPL_MODE_SLOPPY'
      | 'repl.REPL_MODE_STRICT'
      | 'repl.Recoverable()'
      | 'repl.Recoverable'
      | 'repl.builtinModules'
      | 'sea'
      | 'sea.isSea'
      | 'sea.getAsset'
      | 'sea.getAssetAsBlob'
      | 'sea.getRawAsset'
      | 'sea.sea.isSea'
      | 'sea.sea.getAsset'
      | 'sea.sea.getAssetAsBlob'
      | 'sea.sea.getRawAsset'
      | 'stream'
      | 'stream.promises'
      | 'stream.promises.pipeline'
      | 'stream.promises.finished'
      | 'stream.finished'
      | 'stream.pipeline'
      | 'stream.compose'
      | 'stream.duplexPair'
      | 'stream.Readable'
      | 'stream.Readable.from'
      | 'stream.Readable.isDisturbed'
      | 'stream.Readable.fromWeb'
      | 'stream.Readable.toWeb'
      | 'stream.Writable'
      | 'stream.Writable.fromWeb'
      | 'stream.Writable.toWeb'
      | 'stream.Duplex'
      | 'stream.Duplex.from'
      | 'stream.Duplex.fromWeb'
      | 'stream.Duplex.toWeb'
      | 'stream.Transform'
      | 'stream.isErrored'
      | 'stream.isReadable'
      | 'stream.addAbortSignal'
      | 'stream.getDefaultHighWaterMark'
      | 'stream.setDefaultHighWaterMark'
      | 'stream/promises.pipeline'
      | 'stream/promises.finished'
      | 'stream/web'
      | 'stream/web.ReadableStream'
      | 'stream/web.ReadableStream.from'
      | 'stream/web.ReadableStreamDefaultReader'
      | 'stream/web.ReadableStreamBYOBReader'
      | 'stream/web.ReadableStreamDefaultController'
      | 'stream/web.ReadableByteStreamController'
      | 'stream/web.ReadableStreamBYOBRequest'
      | 'stream/web.WritableStream'
      | 'stream/web.WritableStreamDefaultWriter'
      | 'stream/web.WritableStreamDefaultController'
      | 'stream/web.TransformStream'
      | 'stream/web.TransformStreamDefaultController'
      | 'stream/web.ByteLengthQueuingStrategy'
      | 'stream/web.CountQueuingStrategy'
      | 'stream/web.TextEncoderStream'
      | 'stream/web.TextDecoderStream'
      | 'stream/web.CompressionStream'
      | 'stream/web.DecompressionStream'
      | 'stream/consumers'
      | 'stream/consumers.arrayBuffer'
      | 'stream/consumers.blob'
      | 'stream/consumers.buffer'
      | 'stream/consumers.json'
      | 'stream/consumers.text'
      | 'string_decoder'
      | 'string_decoder.StringDecoder'
      | 'sqlite'
      | 'sqlite.constants'
      | 'sqlite.constants.SQLITE_CHANGESET_OMIT'
      | 'sqlite.constants.SQLITE_CHANGESET_REPLACE'
      | 'sqlite.constants.SQLITE_CHANGESET_ABORT'
      | 'sqlite.backup'
      | 'sqlite.DatabaseSync'
      | 'sqlite.StatementSync'
      | 'sqlite.SQLITE_CHANGESET_OMIT'
      | 'sqlite.SQLITE_CHANGESET_REPLACE'
      | 'sqlite.SQLITE_CHANGESET_ABORT'
      | 'test'
      | 'test.after'
      | 'test.afterEach'
      | 'test.assert'
      | 'test.assert.register'
      | 'test.before'
      | 'test.beforeEach'
      | 'test.describe'
      | 'test.describe.only'
      | 'test.describe.skip'
      | 'test.describe.todo'
      | 'test.it'
      | 'test.it.only'
      | 'test.it.skip'
      | 'test.it.todo'
      | 'test.mock'
      | 'test.mock.fn'
      | 'test.mock.getter'
      | 'test.mock.method'
      | 'test.mock.module'
      | 'test.mock.reset'
      | 'test.mock.restoreAll'
      | 'test.mock.setter'
      | 'test.mock.timers'
      | 'test.mock.timers.enable'
      | 'test.mock.timers.reset'
      | 'test.mock.timers.tick'
      | 'test.only'
      | 'test.run'
      | 'test.snapshot'
      | 'test.snapshot.setDefaultSnapshotSerializers'
      | 'test.snapshot.setResolveSnapshotPath'
      | 'test.skip'
      | 'test.suite'
      | 'test.test'
      | 'test.test.only'
      | 'test.test.skip'
      | 'test.test.todo'
      | 'test.todo'
      | 'timers'
      | 'timers.Immediate'
      | 'timers.Timeout'
      | 'timers.setImmediate'
      | 'timers.clearImmediate'
      | 'timers.setInterval'
      | 'timers.clearInterval'
      | 'timers.setTimeout'
      | 'timers.clearTimeout'
      | 'timers.promises'
      | 'timers.promises.setTimeout'
      | 'timers.promises.setImmediate'
      | 'timers.promises.setInterval'
      | 'timers.promises.scheduler.wait'
      | 'timers.promises.scheduler.yield'
      | 'timers/promises'
      | 'timers/promises.setTimeout'
      | 'timers/promises.setImmediate'
      | 'timers/promises.setInterval'
      | 'timers/promises.scheduler.wait'
      | 'timers/promises.scheduler.yield'
      | 'tls'
      | 'tls.checkServerIdentity'
      | 'tls.connect'
      | 'tls.createSecureContext'
      | 'tls.createSecurePair'
      | 'tls.createServer'
      | 'tls.CryptoStream'
      | 'tls.DEFAULT_CIPHERS'
      | 'tls.DEFAULT_ECDH_CURVE'
      | 'tls.DEFAULT_MAX_VERSION'
      | 'tls.DEFAULT_MIN_VERSION'
      | 'tls.getCACertificates'
      | 'tls.getCiphers'
      | 'tls.rootCertificates'
      | 'tls.SecureContext'
      | 'tls.SecurePair'
      | 'tls.Server'
      | 'tls.setDefaultCACertificates'
      | 'tls.TLSSocket'
      | 'trace_events'
      | 'trace_events.createTracing'
      | 'trace_events.getEnabledCategories'
      | 'tty'
      | 'tty.isatty'
      | 'tty.ReadStream'
      | 'tty.WriteStream'
      | 'url'
      | 'url.domainToASCII'
      | 'url.domainToUnicode'
      | 'url.fileURLToPath'
      | 'url.format'
      | 'url.pathToFileURL'
      | 'url.urlToHttpOptions'
      | 'url.URL'
      | 'url.URL.canParse'
      | 'url.URL.createObjectURL'
      | 'url.URL.revokeObjectURL'
      | 'url.URLPattern'
      | 'url.URLSearchParams'
      | 'url.Url'
      | 'util.promisify'
      | 'util.promisify.custom'
      | 'util.callbackify'
      | 'util.debuglog'
      | 'util.debug'
      | 'util.deprecate'
      | 'util.diff'
      | 'util.format'
      | 'util.formatWithOptions'
      | 'util.getCallSite'
      | 'util.getCallSites'
      | 'util.getSystemErrorName'
      | 'util.getSystemErrorMap'
      | 'util.getSystemErrorMessage'
      | 'util.inherits'
      | 'util.inspect'
      | 'util.inspect.custom'
      | 'util.inspect.defaultOptions'
      | 'util.inspect.replDefaults'
      | 'util.isDeepStrictEqual'
      | 'util.parseArgs'
      | 'util.parseEnv'
      | 'util.setTraceSigInt'
      | 'util.stripVTControlCharacters'
      | 'util.styleText'
      | 'util.toUSVString'
      | 'util.transferableAbortController'
      | 'util.transferableAbortSignal'
      | 'util.aborted'
      | 'util.MIMEType'
      | 'util.MIMEParams'
      | 'util.TextDecoder'
      | 'util.TextEncoder'
      | 'util.types'
      | 'util.types.isExternal'
      | 'util.types.isDate'
      | 'util.types.isArgumentsObject'
      | 'util.types.isBigIntObject'
      | 'util.types.isBooleanObject'
      | 'util.types.isNumberObject'
      | 'util.types.isStringObject'
      | 'util.types.isSymbolObject'
      | 'util.types.isNativeError'
      | 'util.types.isRegExp'
      | 'util.types.isAsyncFunction'
      | 'util.types.isGeneratorFunction'
      | 'util.types.isGeneratorObject'
      | 'util.types.isPromise'
      | 'util.types.isMap'
      | 'util.types.isSet'
      | 'util.types.isMapIterator'
      | 'util.types.isSetIterator'
      | 'util.types.isWeakMap'
      | 'util.types.isWeakSet'
      | 'util.types.isArrayBuffer'
      | 'util.types.isDataView'
      | 'util.types.isSharedArrayBuffer'
      | 'util.types.isProxy'
      | 'util.types.isModuleNamespaceObject'
      | 'util.types.isAnyArrayBuffer'
      | 'util.types.isBoxedPrimitive'
      | 'util.types.isArrayBufferView'
      | 'util.types.isTypedArray'
      | 'util.types.isUint8Array'
      | 'util.types.isUint8ClampedArray'
      | 'util.types.isUint16Array'
      | 'util.types.isUint32Array'
      | 'util.types.isInt8Array'
      | 'util.types.isInt16Array'
      | 'util.types.isInt32Array'
      | 'util.types.isFloat16Array'
      | 'util.types.isFloat32Array'
      | 'util.types.isFloat64Array'
      | 'util.types.isBigInt64Array'
      | 'util.types.isBigUint64Array'
      | 'util.types.isKeyObject'
      | 'util.types.isCryptoKey'
      | 'util.types.isWebAssemblyCompiledModule'
      | 'util._extend'
      | 'util.isArray'
      | 'util.isBoolean'
      | 'util.isBuffer'
      | 'util.isDate'
      | 'util.isError'
      | 'util.isFunction'
      | 'util.isNull'
      | 'util.isNullOrUndefined'
      | 'util.isNumber'
      | 'util.isObject'
      | 'util.isPrimitive'
      | 'util.isRegExp'
      | 'util.isString'
      | 'util.isSymbol'
      | 'util.isUndefined'
      | 'util.log'
      | 'util'
      | 'util/types'
      | 'util/types.isExternal'
      | 'util/types.isDate'
      | 'util/types.isArgumentsObject'
      | 'util/types.isBigIntObject'
      | 'util/types.isBooleanObject'
      | 'util/types.isNumberObject'
      | 'util/types.isStringObject'
      | 'util/types.isSymbolObject'
      | 'util/types.isNativeError'
      | 'util/types.isRegExp'
      | 'util/types.isAsyncFunction'
      | 'util/types.isGeneratorFunction'
      | 'util/types.isGeneratorObject'
      | 'util/types.isPromise'
      | 'util/types.isMap'
      | 'util/types.isSet'
      | 'util/types.isMapIterator'
      | 'util/types.isSetIterator'
      | 'util/types.isWeakMap'
      | 'util/types.isWeakSet'
      | 'util/types.isArrayBuffer'
      | 'util/types.isDataView'
      | 'util/types.isSharedArrayBuffer'
      | 'util/types.isProxy'
      | 'util/types.isModuleNamespaceObject'
      | 'util/types.isAnyArrayBuffer'
      | 'util/types.isBoxedPrimitive'
      | 'util/types.isArrayBufferView'
      | 'util/types.isTypedArray'
      | 'util/types.isUint8Array'
      | 'util/types.isUint8ClampedArray'
      | 'util/types.isUint16Array'
      | 'util/types.isUint32Array'
      | 'util/types.isInt8Array'
      | 'util/types.isInt16Array'
      | 'util/types.isInt32Array'
      | 'util/types.isFloat16Array'
      | 'util/types.isFloat32Array'
      | 'util/types.isFloat64Array'
      | 'util/types.isBigInt64Array'
      | 'util/types.isBigUint64Array'
      | 'util/types.isKeyObject'
      | 'util/types.isCryptoKey'
      | 'util/types.isWebAssemblyCompiledModule'
      | 'v8'
      | 'v8.serialize'
      | 'v8.deserialize'
      | 'v8.Serializer'
      | 'v8.Deserializer'
      | 'v8.DefaultSerializer'
      | 'v8.DefaultDeserializer'
      | 'v8.promiseHooks'
      | 'v8.promiseHooks.onInit'
      | 'v8.promiseHooks.onSettled'
      | 'v8.promiseHooks.onBefore'
      | 'v8.promiseHooks.onAfter'
      | 'v8.promiseHooks.createHook'
      | 'v8.startupSnapshot'
      | 'v8.startupSnapshot.addSerializeCallback'
      | 'v8.startupSnapshot.addDeserializeCallback'
      | 'v8.startupSnapshot.setDeserializeMainFunction'
      | 'v8.startupSnapshot.isBuildingSnapshot'
      | 'v8.cachedDataVersionTag'
      | 'v8.getHeapCodeStatistics'
      | 'v8.getHeapSnapshot'
      | 'v8.getHeapSpaceStatistics'
      | 'v8.getHeapStatistics'
      | 'v8.isStringOneByteRepresentation'
      | 'v8.queryObjects'
      | 'v8.setFlagsFromString'
      | 'v8.stopCoverage'
      | 'v8.takeCoverage'
      | 'v8.writeHeapSnapshot'
      | 'v8.setHeapSnapshotNearHeapLimit'
      | 'v8.GCProfiler'
      | 'vm.constants'
      | 'vm.compileFunction'
      | 'vm.createContext'
      | 'vm.isContext'
      | 'vm.measureMemory'
      | 'vm.runInContext'
      | 'vm.runInNewContext'
      | 'vm.runInThisContext'
      | 'vm.Script'
      | 'vm.Module'
      | 'vm.SourceTextModule'
      | 'vm.SyntheticModule'
      | 'vm'
      | 'wasi.WASI'
      | 'wasi'
      | 'worker_threads'
      | 'worker_threads.parentPort'
      | 'worker_threads.resourceLimits'
      | 'worker_threads.SHARE_ENV'
      | 'worker_threads.threadId'
      | 'worker_threads.workerData'
      | 'worker_threads.getEnvironmentData'
      | 'worker_threads.getHeapStatistics'
      | 'worker_threads.markAsUncloneable'
      | 'worker_threads.markAsUntransferable'
      | 'worker_threads.isInternalThread'
      | 'worker_threads.isMainThread'
      | 'worker_threads.isMarkedAsUntransferable'
      | 'worker_threads.moveMessagePortToContext'
      | 'worker_threads.postMessageToThread'
      | 'worker_threads.receiveMessageOnPort'
      | 'worker_threads.setEnvironmentData'
      | 'worker_threads.BroadcastChannel'
      | 'worker_threads.MessageChannel'
      | 'worker_threads.MessagePort'
      | 'worker_threads.Worker'
      | 'zlib.brotliCompress'
      | 'zlib.brotliCompressSync'
      | 'zlib.brotliDecompress'
      | 'zlib.brotliDecompressSync'
      | 'zlib.constants'
      | 'zlib.constants.ZSTD_e_continue'
      | 'zlib.constants.ZSTD_e_flush'
      | 'zlib.constants.ZSTD_e_end'
      | 'zlib.constants.ZSTD_fast'
      | 'zlib.constants.ZSTD_dfast'
      | 'zlib.constants.ZSTD_greedy'
      | 'zlib.constants.ZSTD_lazy'
      | 'zlib.constants.ZSTD_lazy2'
      | 'zlib.constants.ZSTD_btlazy2'
      | 'zlib.constants.ZSTD_btopt'
      | 'zlib.constants.ZSTD_btultra'
      | 'zlib.constants.ZSTD_btultra2'
      | 'zlib.constants.ZSTD_c_compressionLevel'
      | 'zlib.constants.ZSTD_c_windowLog'
      | 'zlib.constants.ZSTD_c_hashLog'
      | 'zlib.constants.ZSTD_c_chainLog'
      | 'zlib.constants.ZSTD_c_searchLog'
      | 'zlib.constants.ZSTD_c_minMatch'
      | 'zlib.constants.ZSTD_c_targetLength'
      | 'zlib.constants.ZSTD_c_strategy'
      | 'zlib.constants.ZSTD_c_enableLongDistanceMatching'
      | 'zlib.constants.ZSTD_c_ldmHashLog'
      | 'zlib.constants.ZSTD_c_ldmMinMatch'
      | 'zlib.constants.ZSTD_c_ldmBucketSizeLog'
      | 'zlib.constants.ZSTD_c_ldmHashRateLog'
      | 'zlib.constants.ZSTD_c_contentSizeFlag'
      | 'zlib.constants.ZSTD_c_checksumFlag'
      | 'zlib.constants.ZSTD_c_dictIDFlag'
      | 'zlib.constants.ZSTD_c_nbWorkers'
      | 'zlib.constants.ZSTD_c_jobSize'
      | 'zlib.constants.ZSTD_c_overlapLog'
      | 'zlib.constants.ZSTD_d_windowLogMax'
      | 'zlib.constants.ZSTD_CLEVEL_DEFAULT'
      | 'zlib.constants.ZSTD_error_no_error'
      | 'zlib.constants.ZSTD_error_GENERIC'
      | 'zlib.constants.ZSTD_error_prefix_unknown'
      | 'zlib.constants.ZSTD_error_version_unsupported'
      | 'zlib.constants.ZSTD_error_frameParameter_unsupported'
      | 'zlib.constants.ZSTD_error_frameParameter_windowTooLarge'
      | 'zlib.constants.ZSTD_error_corruption_detected'
      | 'zlib.constants.ZSTD_error_checksum_wrong'
      | 'zlib.constants.ZSTD_error_literals_headerWrong'
      | 'zlib.constants.ZSTD_error_dictionary_corrupted'
      | 'zlib.constants.ZSTD_error_dictionary_wrong'
      | 'zlib.constants.ZSTD_error_dictionaryCreation_failed'
      | 'zlib.constants.ZSTD_error_parameter_unsupported'
      | 'zlib.constants.ZSTD_error_parameter_combination_unsupported'
      | 'zlib.constants.ZSTD_error_parameter_outOfBound'
      | 'zlib.constants.ZSTD_error_tableLog_tooLarge'
      | 'zlib.constants.ZSTD_error_maxSymbolValue_tooLarge'
      | 'zlib.constants.ZSTD_error_maxSymbolValue_tooSmall'
      | 'zlib.constants.ZSTD_error_stabilityCondition_notRespected'
      | 'zlib.constants.ZSTD_error_stage_wrong'
      | 'zlib.constants.ZSTD_error_init_missing'
      | 'zlib.constants.ZSTD_error_memory_allocation'
      | 'zlib.constants.ZSTD_error_workSpace_tooSmall'
      | 'zlib.constants.ZSTD_error_dstSize_tooSmall'
      | 'zlib.constants.ZSTD_error_srcSize_wrong'
      | 'zlib.constants.ZSTD_error_dstBuffer_null'
      | 'zlib.constants.ZSTD_error_noForwardProgress_destFull'
      | 'zlib.constants.ZSTD_error_noForwardProgress_inputEmpty'
      | 'zlib.crc32'
      | 'zlib.createBrotliCompress'
      | 'zlib.createBrotliDecompress'
      | 'zlib.createDeflate'
      | 'zlib.createDeflateRaw'
      | 'zlib.createGunzip'
      | 'zlib.createGzip'
      | 'zlib.createInflate'
      | 'zlib.createInflateRaw'
      | 'zlib.createUnzip'
      | 'zlib.createZstdCompress'
      | 'zlib.createZstdDecompress'
      | 'zlib.deflate'
      | 'zlib.deflateRaw'
      | 'zlib.deflateRawSync'
      | 'zlib.deflateSync'
      | 'zlib.gunzip'
      | 'zlib.gunzipSync'
      | 'zlib.gzip'
      | 'zlib.gzipSync'
      | 'zlib.inflate'
      | 'zlib.inflateRaw'
      | 'zlib.inflateRawSync'
      | 'zlib.inflateSync'
      | 'zlib.unzip'
      | 'zlib.unzipSync'
      | 'zlib.zstdCompress'
      | 'zlib.zstdCompressSync'
      | 'zlib.zstdDecompress'
      | 'zlib.zstdDecompressSync'
      | 'zlib.BrotliCompress()'
      | 'zlib.BrotliCompress'
      | 'zlib.BrotliDecompress()'
      | 'zlib.BrotliDecompress'
      | 'zlib.Deflate()'
      | 'zlib.Deflate'
      | 'zlib.DeflateRaw()'
      | 'zlib.DeflateRaw'
      | 'zlib.Gunzip()'
      | 'zlib.Gunzip'
      | 'zlib.Gzip()'
      | 'zlib.Gzip'
      | 'zlib.Inflate()'
      | 'zlib.Inflate'
      | 'zlib.InflateRaw()'
      | 'zlib.InflateRaw'
      | 'zlib.Unzip()'
      | 'zlib.Unzip'
      | 'zlib.ZstdCompress'
      | 'zlib.ZstdDecompress'
      | 'zlib.ZstdOptions'
      | 'zlib'
      | 'import.meta.resolve'
      | 'import.meta.dirname'
      | 'import.meta.filename'
      | 'import.meta.main'
    )[];
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description enforce either `Buffer` or `require("buffer").Buffer`
 * @link https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/prefer-global/buffer.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | false      |
 *  ```
 */
namespace PreferGlobalBuffer {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "enum": [
   *       "always",
   *       "never"
   *     ]
   *   }
   * ]
   * ```
   */
  export type Options = 'always' | 'never';

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description enforce either `console` or `require("console")`
 * @link https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/prefer-global/console.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | false      |
 *  ```
 */
namespace PreferGlobalConsole {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "enum": [
   *       "always",
   *       "never"
   *     ]
   *   }
   * ]
   * ```
   */
  export type Options = 'always' | 'never';

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description enforce either `crypto` or `require("crypto").webcrypto`
 * @link https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/prefer-global/crypto.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | false      |
 *  ```
 */
namespace PreferGlobalCrypto {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "enum": [
   *       "always",
   *       "never"
   *     ]
   *   }
   * ]
   * ```
   */
  export type Options = 'always' | 'never';

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description enforce either `process` or `require("process")`
 * @link https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/prefer-global/process.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | false      |
 *  ```
 */
namespace PreferGlobalProcess {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "enum": [
   *       "always",
   *       "never"
   *     ]
   *   }
   * ]
   * ```
   */
  export type Options = 'always' | 'never';

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description enforce either `TextDecoder` or `require("util").TextDecoder`
 * @link https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/prefer-global/text-decoder.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | false      |
 *  ```
 */
namespace PreferGlobalTextDecoder {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "enum": [
   *       "always",
   *       "never"
   *     ]
   *   }
   * ]
   * ```
   */
  export type Options = 'always' | 'never';

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description enforce either `TextEncoder` or `require("util").TextEncoder`
 * @link https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/prefer-global/text-encoder.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | false      |
 *  ```
 */
namespace PreferGlobalTextEncoder {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "enum": [
   *       "always",
   *       "never"
   *     ]
   *   }
   * ]
   * ```
   */
  export type Options = 'always' | 'never';

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description enforce either `URLSearchParams` or `require("url").URLSearchParams`
 * @link https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/prefer-global/url-search-params.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | false      |
 *  ```
 */
namespace PreferGlobalUrlSearchParams {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "enum": [
   *       "always",
   *       "never"
   *     ]
   *   }
   * ]
   * ```
   */
  export type Options = 'always' | 'never';

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description enforce either `URL` or `require("url").URL`
 * @link https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/prefer-global/url.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | false      |
 *  ```
 */
namespace PreferGlobalUrl {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "enum": [
   *       "always",
   *       "never"
   *     ]
   *   }
   * ]
   * ```
   */
  export type Options = 'always' | 'never';

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description enforce either global timer functions or `require("timers")`
 * @link https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/prefer-global/timers.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | false      |
 *  ```
 */
namespace PreferGlobalTimers {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "enum": [
   *       "always",
   *       "never"
   *     ]
   *   }
   * ]
   * ```
   */
  export type Options = 'always' | 'never';

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description enforce using the `node:` protocol when importing Node.js builtin modules.
 * @link https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/prefer-node-protocol.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | fixable     | code       |
 *  | recommended | false      |
 *  ```
 */
namespace PreferNodeProtocol {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "version": {
   *         "type": "string"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    version?: string;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description enforce `require("dns").promises`
 * @link https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/prefer-promises/dns.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | false      |
 *  ```
 */
namespace PreferPromisesDns {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description enforce `require("fs").promises`
 * @link https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/prefer-promises/fs.md
 *
 *  ```md
 *  | key         | value      |
 *  | :---------- | :--------- |
 *  | type        | suggestion |
 *  | deprecated  | false      |
 *  | recommended | false      |
 *  ```
 */
namespace PreferPromisesFs {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description require that `process.exit()` expressions use the same code path as `throw`
 * @link https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/process-exit-as-throw.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | false   |
 *  | recommended | true    |
 *  ```
 */
namespace ProcessExitAsThrow {
  export type RuleEntry = Linter.StringSeverity;
}

/**
 * @description require correct usage of hashbang
 * @link https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/hashbang.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | false   |
 *  | fixable     | code    |
 *  | recommended | true    |
 *  ```
 */
namespace Hashbang {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "convertPath": {
   *         "anyOf": [
   *           {
   *             "type": "object",
   *             "properties": {},
   *             "patternProperties": {
   *               "^.+$": {
   *                 "type": "array",
   *                 "items": {
   *                   "type": "string"
   *                 },
   *                 "minItems": 2,
   *                 "maxItems": 2
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           {
   *             "type": "array",
   *             "items": {
   *               "type": "object",
   *               "properties": {
   *                 "include": {
   *                   "type": "array",
   *                   "items": {
   *                     "type": "string"
   *                   },
   *                   "minItems": 1,
   *                   "uniqueItems": true
   *                 },
   *                 "exclude": {
   *                   "type": "array",
   *                   "items": {
   *                     "type": "string"
   *                   },
   *                   "uniqueItems": true
   *                 },
   *                 "replace": {
   *                   "type": "array",
   *                   "items": {
   *                     "type": "string"
   *                   },
   *                   "minItems": 2,
   *                   "maxItems": 2
   *                 }
   *               },
   *               "additionalProperties": false,
   *               "required": [
   *                 "include",
   *                 "replace"
   *               ]
   *             },
   *             "minItems": 1
   *           }
   *         ]
   *       },
   *       "ignoreUnpublished": {
   *         "type": "boolean"
   *       },
   *       "additionalExecutables": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         }
   *       },
   *       "executableMap": {
   *         "type": "object",
   *         "patternProperties": {
   *           "^\\.\\w+$": {
   *             "type": "string",
   *             "pattern": "^[\\w-]+$"
   *           }
   *         },
   *         "additionalProperties": false
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type Options = Readonly<{
    convertPath?:
      | Readonly<Record<string, readonly [string, string]>>
      | readonly [
          Readonly<{
            /**
             * @minItems 1
             */
            include: readonly [string, ...string[]];
            exclude?: readonly string[];
            /**
             * @minItems 2
             * @maxItems 2
             */
            replace: readonly [string, string];
          }>,
          ...Readonly<{
            /**
             * @minItems 1
             */
            include: readonly [string, ...string[]];
            exclude?: readonly string[];
            /**
             * @minItems 2
             * @maxItems 2
             */
            replace: readonly [string, string];
          }>[],
        ];
    ignoreUnpublished?: boolean;
    additionalExecutables?: readonly string[];
    executableMap?: Readonly<Record<string, string>>;
  }>;

  export type RuleEntry =
    | 'off'
    | Linter.Severity
    | SpreadOptionsIfIsArray<readonly [Linter.StringSeverity, Options]>;
}

/**
 * @description disallow third-party modules which are hiding core modules
 * @link https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/no-hide-core-modules.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | true    |
 *  | recommended | false   |
 *  ```
 */
namespace NoHideCoreModules {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "allow": {
   *         "type": "array",
   *         "items": {
   *           "enum": [
   *             "assert",
   *             "buffer",
   *             "child_process",
   *             "cluster",
   *             "console",
   *             "constants",
   *             "crypto",
   *             "dgram",
   *             "dns",
   *             "events",
   *             "fs",
   *             "http",
   *             "https",
   *             "module",
   *             "net",
   *             "os",
   *             "path",
   *             "querystring",
   *             "readline",
   *             "repl",
   *             "stream",
   *             "string_decoder",
   *             "timers",
   *             "tls",
   *             "tty",
   *             "url",
   *             "util",
   *             "vm",
   *             "zlib"
   *           ]
   *         },
   *         "additionalItems": false,
   *         "uniqueItems": true
   *       },
   *       "ignoreDirectDependencies": {
   *         "type": "boolean"
   *       },
   *       "ignoreIndirectDependencies": {
   *         "type": "boolean"
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type RuleEntry = 0;
}

/**
 * @description require correct usage of hashbang
 * @link https://github.com/eslint-community/eslint-plugin-n/blob/HEAD/docs/rules/hashbang.md
 *
 *  ```md
 *  | key         | value   |
 *  | :---------- | :------ |
 *  | type        | problem |
 *  | deprecated  | true    |
 *  | fixable     | code    |
 *  | recommended | false   |
 *  ```
 */
namespace Shebang {
  /**
   * ### schema
   *
   * ```json
   * [
   *   {
   *     "type": "object",
   *     "properties": {
   *       "convertPath": {
   *         "anyOf": [
   *           {
   *             "type": "object",
   *             "properties": {},
   *             "patternProperties": {
   *               "^.+$": {
   *                 "type": "array",
   *                 "items": {
   *                   "type": "string"
   *                 },
   *                 "minItems": 2,
   *                 "maxItems": 2
   *               }
   *             },
   *             "additionalProperties": false
   *           },
   *           {
   *             "type": "array",
   *             "items": {
   *               "type": "object",
   *               "properties": {
   *                 "include": {
   *                   "type": "array",
   *                   "items": {
   *                     "type": "string"
   *                   },
   *                   "minItems": 1,
   *                   "uniqueItems": true
   *                 },
   *                 "exclude": {
   *                   "type": "array",
   *                   "items": {
   *                     "type": "string"
   *                   },
   *                   "uniqueItems": true
   *                 },
   *                 "replace": {
   *                   "type": "array",
   *                   "items": {
   *                     "type": "string"
   *                   },
   *                   "minItems": 2,
   *                   "maxItems": 2
   *                 }
   *               },
   *               "additionalProperties": false,
   *               "required": [
   *                 "include",
   *                 "replace"
   *               ]
   *             },
   *             "minItems": 1
   *           }
   *         ]
   *       },
   *       "ignoreUnpublished": {
   *         "type": "boolean"
   *       },
   *       "additionalExecutables": {
   *         "type": "array",
   *         "items": {
   *           "type": "string"
   *         }
   *       },
   *       "executableMap": {
   *         "type": "object",
   *         "patternProperties": {
   *           "^\\.\\w+$": {
   *             "type": "string",
   *             "pattern": "^[\\w-]+$"
   *           }
   *         },
   *         "additionalProperties": false
   *       }
   *     },
   *     "additionalProperties": false
   *   }
   * ]
   * ```
   */
  export type RuleEntry = 0;
}

export type EslintNRules = Readonly<{
  'n/callback-return': CallbackReturn.RuleEntry;
  'n/exports-style': ExportsStyle.RuleEntry;
  'n/file-extension-in-import': FileExtensionInImport.RuleEntry;
  'n/global-require': GlobalRequire.RuleEntry;
  'n/handle-callback-err': HandleCallbackErr.RuleEntry;
  'n/no-callback-literal': NoCallbackLiteral.RuleEntry;
  'n/no-deprecated-api': NoDeprecatedApi.RuleEntry;
  'n/no-exports-assign': NoExportsAssign.RuleEntry;
  'n/no-extraneous-import': NoExtraneousImport.RuleEntry;
  'n/no-extraneous-require': NoExtraneousRequire.RuleEntry;
  'n/no-missing-import': NoMissingImport.RuleEntry;
  'n/no-missing-require': NoMissingRequire.RuleEntry;
  'n/no-mixed-requires': NoMixedRequires.RuleEntry;
  'n/no-new-require': NoNewRequire.RuleEntry;
  'n/no-path-concat': NoPathConcat.RuleEntry;
  'n/no-process-env': NoProcessEnv.RuleEntry;
  'n/no-process-exit': NoProcessExit.RuleEntry;
  'n/no-restricted-import': NoRestrictedImport.RuleEntry;
  'n/no-restricted-require': NoRestrictedRequire.RuleEntry;
  'n/no-sync': NoSync.RuleEntry;
  'n/no-top-level-await': NoTopLevelAwait.RuleEntry;
  'n/no-unpublished-bin': NoUnpublishedBin.RuleEntry;
  'n/no-unpublished-import': NoUnpublishedImport.RuleEntry;
  'n/no-unpublished-require': NoUnpublishedRequire.RuleEntry;
  'n/no-unsupported-features/es-builtins': NoUnsupportedFeaturesEsBuiltins.RuleEntry;
  'n/no-unsupported-features/es-syntax': NoUnsupportedFeaturesEsSyntax.RuleEntry;
  'n/no-unsupported-features/node-builtins': NoUnsupportedFeaturesNodeBuiltins.RuleEntry;
  'n/prefer-global/buffer': PreferGlobalBuffer.RuleEntry;
  'n/prefer-global/console': PreferGlobalConsole.RuleEntry;
  'n/prefer-global/crypto': PreferGlobalCrypto.RuleEntry;
  'n/prefer-global/process': PreferGlobalProcess.RuleEntry;
  'n/prefer-global/text-decoder': PreferGlobalTextDecoder.RuleEntry;
  'n/prefer-global/text-encoder': PreferGlobalTextEncoder.RuleEntry;
  'n/prefer-global/url-search-params': PreferGlobalUrlSearchParams.RuleEntry;
  'n/prefer-global/url': PreferGlobalUrl.RuleEntry;
  'n/prefer-global/timers': PreferGlobalTimers.RuleEntry;
  'n/prefer-node-protocol': PreferNodeProtocol.RuleEntry;
  'n/prefer-promises/dns': PreferPromisesDns.RuleEntry;
  'n/prefer-promises/fs': PreferPromisesFs.RuleEntry;
  'n/process-exit-as-throw': ProcessExitAsThrow.RuleEntry;
  'n/hashbang': Hashbang.RuleEntry;

  // deprecated
  'n/no-hide-core-modules': NoHideCoreModules.RuleEntry;
  'n/shebang': Shebang.RuleEntry;
}>;

export type EslintNRulesOption = Readonly<{
  'n/callback-return': CallbackReturn.Options;
  'n/exports-style': readonly [ExportsStyle.Options0, ExportsStyle.Options1];
  'n/file-extension-in-import': readonly [
    FileExtensionInImport.Options0,
    FileExtensionInImport.Options1,
  ];
  'n/handle-callback-err': HandleCallbackErr.Options;
  'n/no-deprecated-api': NoDeprecatedApi.Options;
  'n/no-extraneous-import': NoExtraneousImport.Options;
  'n/no-extraneous-require': NoExtraneousRequire.Options;
  'n/no-missing-import': NoMissingImport.Options;
  'n/no-missing-require': NoMissingRequire.Options;
  'n/no-mixed-requires': NoMixedRequires.Options;
  'n/no-process-env': NoProcessEnv.Options;
  'n/no-restricted-import': NoRestrictedImport.Options;
  'n/no-restricted-require': NoRestrictedRequire.Options;
  'n/no-sync': NoSync.Options;
  'n/no-top-level-await': NoTopLevelAwait.Options;
  'n/no-unpublished-bin': NoUnpublishedBin.Options;
  'n/no-unpublished-import': NoUnpublishedImport.Options;
  'n/no-unpublished-require': NoUnpublishedRequire.Options;
  'n/no-unsupported-features/es-builtins': NoUnsupportedFeaturesEsBuiltins.Options;
  'n/no-unsupported-features/es-syntax': NoUnsupportedFeaturesEsSyntax.Options;
  'n/no-unsupported-features/node-builtins': NoUnsupportedFeaturesNodeBuiltins.Options;
  'n/prefer-global/buffer': PreferGlobalBuffer.Options;
  'n/prefer-global/console': PreferGlobalConsole.Options;
  'n/prefer-global/crypto': PreferGlobalCrypto.Options;
  'n/prefer-global/process': PreferGlobalProcess.Options;
  'n/prefer-global/text-decoder': PreferGlobalTextDecoder.Options;
  'n/prefer-global/text-encoder': PreferGlobalTextEncoder.Options;
  'n/prefer-global/url-search-params': PreferGlobalUrlSearchParams.Options;
  'n/prefer-global/url': PreferGlobalUrl.Options;
  'n/prefer-global/timers': PreferGlobalTimers.Options;
  'n/prefer-node-protocol': PreferNodeProtocol.Options;
  'n/hashbang': Hashbang.Options;
}>;
