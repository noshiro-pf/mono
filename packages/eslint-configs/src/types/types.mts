import { type Linter } from 'eslint';

export type LinterRulesRecord = Readonly<Partial<Linter.RulesRecord>>;

export type RestrictedImportsOption = DeepReadonly<{
  paths: {
    name: string;
    message: string;
    importNames: string[];
  }[];
}>;
