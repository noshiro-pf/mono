import type { Linter } from 'eslint';

export type LinterRulesRecord = Readonly<Partial<Linter.RulesRecord>>;

export type EslintRulesAll = Readonly<
  Record<'disabledRules' | 'modifiedRules', Partial<Linter.RulesRecord>>
>;

export type RestrictedImportsDef = Readonly<
  {
    name: string,
    importNames?: string,
    message?: string
  },
>;
