import type { Linter } from 'eslint';

export type LinterRulesRecord = Readonly<Partial<Linter.RulesRecord>>;

export type EslintRulesAll = Readonly<
  Record<'disabledRules' | 'modifiedRules', Partial<Linter.RulesRecord>>
>;

export type RestrictedImportsDef = Readonly<{
  name: string;
  importNames?: string;
  message?: string;
}>;

export type ImmutableDataOptions = Readonly<{
  assumeTypes:
    | Readonly<{
        forArrays: boolean;
        forObjects: boolean;
      }>
    | boolean;
  ignoreClass: boolean | 'fieldsOnly';
  ignoreImmediateMutation: boolean;
  ignorePattern?: string | readonly string[];
  ignoreAccessorPattern?: string | readonly string[];
}>;

export type NoLetOptions = Readonly<{
  allowLocalMutation: boolean;
  allowInForLoopInit: boolean;
  ignorePattern?: string | readonly string[];
}>;

export type PreferReadonlyTypeOptions = Readonly<{
  allowLocalMutation: boolean;
  allowMutableReturnType: boolean;
  checkImplicit: boolean;
  ignoreClass: boolean | 'fieldsOnly';
  ignoreInterface: boolean;
  ignoreCollections: boolean;
  ignorePattern?: string | readonly string[];
}>;

export type PreferTacitOptions = Readonly<{
  assumeTypes: Readonly<{ allowFixer: boolean }> | false;
  ignorePattern?: string | readonly string[];
}>;
