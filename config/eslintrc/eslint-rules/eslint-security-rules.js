'use strict';

// @ts-check

/** @typedef { import("./rules-type/eslint-security-rules").EslintSecurityRules } EslintSecurityRules */

/** @type {EslintSecurityRules} */
const eslintSecurityRules = {
  'security/detect-unsafe-regex': 'error',
  'security/detect-non-literal-regexp': 'error',
  'security/detect-non-literal-require': 'error',
  'security/detect-non-literal-fs-filename': 'error',
  'security/detect-eval-with-expression': 'error',
  'security/detect-pseudoRandomBytes': 'error',
  'security/detect-possible-timing-attacks': 'error',
  'security/detect-no-csrf-before-method-override': 'error',
  'security/detect-buffer-noassert': 'error',
  'security/detect-child-process': 'error',
  'security/detect-disable-mustache-escape': 'error',
  'security/detect-object-injection': 'off', // too many false positives
  'security/detect-new-buffer': 'error',
  'security/detect-bidi-characters': 'error',
};

module.exports = { eslintSecurityRules };
