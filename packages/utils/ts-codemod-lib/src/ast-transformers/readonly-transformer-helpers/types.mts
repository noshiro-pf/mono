import type * as ts from 'typescript';

export type ReadonlyTransformerOptions = DeepReadonly<{
  /**
   * Options for a type utility `DeepReadonly` that recursively applies readonly.
   */
  DeepReadonly?: {
    /**
     * The name of a type utility that recursively applies `Readonly`.
     *
     * @default "DeepReadonly"
     */
    typeName?: string;

    /**
     * Whether to apply `DeepReadonly` aggressively or remove `DeepReadonly` as
     * possible.
     *
     * If `applyLevel` is `"applyAgressively"`, it applies `DeepReadonly` to all
     * nested type literals without external type references. For example, the
     * following conversions are applied:
     *
     * - `number[][]` to be `DeepReadonly<number[][]>`
     * - `number[]` to be `readonly number[]`
     * - `<T>(arg: T[][]) => void` to be `<T>(arg: readonly (readonly T[])[]>) =>
     *   void`
     *
     * If `applyLevel` is `"removeAsPossible"`, the following conversions are applied:
     *
     * - `DeepReadonly<number[][]>` to be `readonly (readonly number[])[]`
     * - `DeepReadonly<{ a: number[] }>` to be `Readonly<{ a: readonly number[]
     *   }>`
     * - `<T>(arg: DeepReadonly<T[][]>) => void` to be `<T>(arg:
     *   DeepReadonly<T[][]>) => void`
     *
     * @default 'keep'
     */
    // TODO
    // applyLevel?: 'applyAgressively' | 'keep' | 'removeAsPossible';
  };

  /**
   * Ignore the readonly conversion for `{}`.
   *
   * @default true
   */
  ignoreEmptyObjectTypes?: boolean;

  /**
   * A mute keywords to ignore the readonly conversion.
   *
   * (e.g. `"mut_"`)
   */
  ignorePrefixes?: string[];
}>;

export type ReadonlyTransformerOptionsInternal = Readonly<{
  DeepReadonly: Readonly<{
    typeName: string;

    // removeAsPossible: 正規化後、 DeepReadonly の子ノードが typeLiteral かまたはその union or intersection であり、 それぞれの TypeLiteral がプリミティブ値のメンバーしか持たない場合。
    applyLevel: 'applyAgressively' | 'keep' | 'removeAsPossible';
  }>;

  ignoreEmptyObjectTypes: boolean;

  ignorePrefixChecker: undefined | ((node: ts.Node | undefined) => boolean);
}>;
