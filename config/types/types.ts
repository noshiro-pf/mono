import { type Linter } from 'eslint';
// eslint-disable-next-line import/no-internal-modules
import { type EslintFunctionalRules } from '../eslintrc/eslint-rules/rules-type/eslint-functional-rules';

export type LinterRulesRecord = Readonly<Partial<Linter.RulesRecord>>;

export type RestrictedImportsOption = DeepReadonly<
  | {
      paths: {
        name: string;
        message: string;
        importNames: string[];
      }[];
    }
  | {
      paths: {
        name: string;
        message: string;
      }[];
    }
  | {
      paths: string[];
      patterns: string[];
    }
  | {
      patterns: {
        group: string[];
        message: string;
      }[];
    }
  | { paths: string[] }
>;

export type ImmutableDataOptions = Exclude<
  EslintFunctionalRules['functional/immutable-data'],
  Linter.RuleLevel
>[1];

export type NoLetOptions = Exclude<
  EslintFunctionalRules['functional/no-let'],
  Linter.RuleLevel
>[1];

export type NoExpressionStatementOptions = Exclude<
  EslintFunctionalRules['functional/no-expression-statements'],
  Linter.RuleLevel
>[1];

export type PreferTacitOptions = Exclude<
  EslintFunctionalRules['functional/prefer-tacit'],
  Linter.RuleLevel
>[1];
