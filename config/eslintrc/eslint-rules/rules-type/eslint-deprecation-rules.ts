/* cSpell:disable */
/* eslint-disable functional/no-mixed-types */
/* eslint-disable functional/readonly-type */
/* eslint-disable @typescript-eslint/sort-type-constituents */
import { type Linter } from 'eslint';

/**
 * @description Do not use deprecated APIs.
 * @link https://github.com/gund/eslint-plugin-deprecation
 *
 *  | key                  | value   |
 *  | :------------------- | :------ |
 *  | type                 | problem |
 *  | requiresTypeChecking | true    |
 */
namespace Deprecation {
  export type RuleEntry = Linter.RuleLevel;
}

export type EslintDeprecationRules = {
  readonly 'deprecation/deprecation': Deprecation.RuleEntry;
};
