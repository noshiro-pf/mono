/* cSpell:disable */
/* eslint-disable @typescript-eslint/sort-type-union-intersection-members */
import type { Linter } from 'eslint';

/**
 * @description Locates potentially unsafe regular expressions, which may take a very long time to run, blocking the event loop.
 * @link https://github.com/nodesecurity/eslint-plugin-security/blob/main/docs/regular-expression-dos-and-node.md
 *
 *  | key         | value                           |
 *  | :---------- | :------------------------------ |
 *  | type        | error                           |
 *  | category    | Possible Security Vulnerability |
 *  | recommended | true                            |
 */
namespace DetectUnsafeRegex {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Detects "RegExp(variable)", which might allow an attacker to DOS your server with a long-running regular expression.
 * @link https://github.com/nodesecurity/eslint-plugin-security/blob/main/docs/regular-expression-dos-and-node.md
 *
 *  | key         | value                           |
 *  | :---------- | :------------------------------ |
 *  | type        | error                           |
 *  | category    | Possible Security Vulnerability |
 *  | recommended | true                            |
 */
namespace DetectNonLiteralRegexp {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Detects "require(variable)", which might allow an attacker to load and run arbitrary code, or access arbitrary files on disk.
 * @link https://github.com/nodesecurity/eslint-plugin-security#detect-non-literal-require
 *
 *  | key         | value                           |
 *  | :---------- | :------------------------------ |
 *  | type        | error                           |
 *  | category    | Possible Security Vulnerability |
 *  | recommended | true                            |
 */
namespace DetectNonLiteralRequire {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Detects variable in filename argument of "fs" calls, which might allow an attacker to access anything on your system.
 * @link https://github.com/nodesecurity/eslint-plugin-security#detect-non-literal-fs-filename
 *
 *  | key         | value                           |
 *  | :---------- | :------------------------------ |
 *  | type        | error                           |
 *  | category    | Possible Security Vulnerability |
 *  | recommended | true                            |
 */
namespace DetectNonLiteralFsFilename {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Detects "eval(variable)" which can allow an attacker to run arbitrary code inside your process.
 * @link https://github.com/nodesecurity/eslint-plugin-security#detect-eval-with-expression
 *
 *  | key         | value                           |
 *  | :---------- | :------------------------------ |
 *  | type        | error                           |
 *  | category    | Possible Security Vulnerability |
 *  | recommended | true                            |
 */
namespace DetectEvalWithExpression {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Detects if "pseudoRandomBytes()" is in use, which might not give you the randomness you need and expect.
 * @link https://github.com/nodesecurity/eslint-plugin-security#detect-pseudorandombytes
 *
 *  | key         | value                           |
 *  | :---------- | :------------------------------ |
 *  | type        | error                           |
 *  | category    | Possible Security Vulnerability |
 *  | recommended | true                            |
 */
namespace DetectPseudoRandomBytes {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Detects insecure comparisons (`==`, `!=`, `!==` and `===`), which check input sequentially.
 * @link https://github.com/nodesecurity/eslint-plugin-security#detect-possible-timing-attacks
 *
 *  | key         | value                           |
 *  | :---------- | :------------------------------ |
 *  | type        | error                           |
 *  | category    | Possible Security Vulnerability |
 *  | recommended | true                            |
 */
namespace DetectPossibleTimingAttacks {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Detects Express "csrf" middleware setup before "method-override" middleware.
 * @link https://github.com/nodesecurity/eslint-plugin-security/blob/main/docs/bypass-connect-csrf-protection-by-abusing.md
 *
 *  | key         | value                           |
 *  | :---------- | :------------------------------ |
 *  | type        | error                           |
 *  | category    | Possible Security Vulnerability |
 *  | recommended | true                            |
 */
namespace DetectNoCsrfBeforeMethodOverride {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Detect calls to "buffer" with "noAssert" flag set.
 * @link https://github.com/nodesecurity/eslint-plugin-security#detect-buffer-noassert
 *
 *  | key         | value                           |
 *  | :---------- | :------------------------------ |
 *  | type        | error                           |
 *  | category    | Possible Security Vulnerability |
 *  | recommended | true                            |
 */
namespace DetectBufferNoassert {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Detect instances of "child_process" & non-literal "exec()" calls.
 * @link https://github.com/nodesecurity/eslint-plugin-security/blob/main/docs/avoid-command-injection-node.md
 *
 *  | key         | value                           |
 *  | :---------- | :------------------------------ |
 *  | type        | error                           |
 *  | category    | Possible Security Vulnerability |
 *  | recommended | true                            |
 */
namespace DetectChildProcess {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Detects "object.escapeMarkup = false", which can be used with some template engines to disable escaping of HTML entities.
 * @link https://github.com/nodesecurity/eslint-plugin-security#detect-disable-mustache-escape
 *
 *  | key         | value                           |
 *  | :---------- | :------------------------------ |
 *  | type        | error                           |
 *  | category    | Possible Security Vulnerability |
 *  | recommended | true                            |
 */
namespace DetectDisableMustacheEscape {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Detects "variable[key]" as a left- or right-hand assignment operand.
 * @link https://github.com/nodesecurity/eslint-plugin-security/blob/main/docs/the-dangers-of-square-bracket-notation.md
 *
 *  | key         | value                           |
 *  | :---------- | :------------------------------ |
 *  | type        | error                           |
 *  | category    | Possible Security Vulnerability |
 *  | recommended | true                            |
 */
namespace DetectObjectInjection {
  export type RuleEntry = Linter.RuleLevel;
}

/**
 * @description Detect instances of new Buffer(argument) where argument is any non-literal value.
 * @link https://github.com/nodesecurity/eslint-plugin-security/blob/main/README.md
 *
 *  | key         | value                           |
 *  | :---------- | :------------------------------ |
 *  | type        | error                           |
 *  | category    | Possible Security Vulnerability |
 *  | recommended | true                            |
 */
namespace DetectNewBuffer {
  export type RuleEntry = Linter.RuleLevel;
}

export type EslintSecurityRules = {
  readonly 'security/detect-unsafe-regex': DetectUnsafeRegex.RuleEntry;
  readonly 'security/detect-non-literal-regexp': DetectNonLiteralRegexp.RuleEntry;
  readonly 'security/detect-non-literal-require': DetectNonLiteralRequire.RuleEntry;
  readonly 'security/detect-non-literal-fs-filename': DetectNonLiteralFsFilename.RuleEntry;
  readonly 'security/detect-eval-with-expression': DetectEvalWithExpression.RuleEntry;
  readonly 'security/detect-pseudoRandomBytes': DetectPseudoRandomBytes.RuleEntry;
  readonly 'security/detect-possible-timing-attacks': DetectPossibleTimingAttacks.RuleEntry;
  readonly 'security/detect-no-csrf-before-method-override': DetectNoCsrfBeforeMethodOverride.RuleEntry;
  readonly 'security/detect-buffer-noassert': DetectBufferNoassert.RuleEntry;
  readonly 'security/detect-child-process': DetectChildProcess.RuleEntry;
  readonly 'security/detect-disable-mustache-escape': DetectDisableMustacheEscape.RuleEntry;
  readonly 'security/detect-object-injection': DetectObjectInjection.RuleEntry;
  readonly 'security/detect-new-buffer': DetectNewBuffer.RuleEntry;
};