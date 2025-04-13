import type * as ts from 'typescript';

export type ReadonlyTransformerOptions = Readonly<{
  /**
   * The name of a type utility that recursively applies `Readonly`.
   *
   * (e.g. `DeepReadonly`)
   */
  DeepReadonlyTypeName?: string;

  /**
   * A mute keywords to ignore the readonly conversion.
   *
   * (e.g. `"mut_"`)
   */
  ignorePrefixes?: readonly string[];
}>;

export type ReadonlyTransformerOptionsInternal = Readonly<{
  DeepReadonlyTypeName: string;
  ignorePrefixChecker: undefined | ((node: ts.Node | undefined) => boolean);
}>;
