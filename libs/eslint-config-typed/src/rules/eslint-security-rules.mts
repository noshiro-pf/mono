import type { EslintSecurityRules } from '../types/index.mjs';

export const eslintSecurityRules = {
  'security/detect-unsafe-regex': 'error',
  'security/detect-non-literal-regexp': 'error',
  // Covered by import-x/no-dynamic-require
  'security/detect-non-literal-require': 'off',
  'security/detect-non-literal-fs-filename': 'error',
  // Covered by no-eval, which reports every `eval()`
  'security/detect-eval-with-expression': 'off',
  'security/detect-pseudoRandomBytes': 'error',
  'security/detect-possible-timing-attacks': 'error',
  'security/detect-no-csrf-before-method-override': 'error',
  'security/detect-buffer-noassert': 'error',
  'security/detect-child-process': 'error',
  'security/detect-disable-mustache-escape': 'error',
  'security/detect-object-injection': 'off', // too many false positives
  // Covered by unicorn/no-new-buffer, which reports every `new Buffer()`
  'security/detect-new-buffer': 'off',
  'security/detect-bidi-characters': 'error',
  'security/detect-invisible-characters': 'error',
} as const satisfies EslintSecurityRules;
