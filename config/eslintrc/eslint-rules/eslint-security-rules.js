'use strict';

// @ts-check

/** @typedef { import("./rules-type/eslint-security-rules").EslintSecurityRules } EslintSecurityRules */

/** @type {EslintSecurityRules} */
const eslintSecurityRules = {
  'security/detect-unsafe-regex': 'warn',
  'security/detect-non-literal-regexp': 'warn',
  'security/detect-non-literal-require': 'warn',
  'security/detect-non-literal-fs-filename': 'warn',
  'security/detect-eval-with-expression': 'warn',
  'security/detect-pseudoRandomBytes': 'warn',
  'security/detect-possible-timing-attacks': 'warn',
  'security/detect-no-csrf-before-method-override': 'warn',
  'security/detect-buffer-noassert': 'warn',
  'security/detect-child-process': 'warn',
  'security/detect-disable-mustache-escape': 'warn',
  'security/detect-object-injection': 'warn',
  'security/detect-new-buffer': 'warn',
};

module.exports = { eslintSecurityRules };
