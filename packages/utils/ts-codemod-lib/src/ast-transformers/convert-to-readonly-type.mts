/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */
import {
  Arr,
  expectType,
  ISet,
  mapOptional,
  pipe,
  SafeUint,
  strictMatch,
} from '@noshiro/ts-utils';
import * as ts from 'typescript';
import {
  createReadonlyArrayTypeNode,
  createReadonlyTypeNode,
  createReadonlyTypeOperatorNode,
  hasDisableNextLineComment,
  isPrimitiveTypeNode,
  isReadonlyArrayTypeNode,
  isReadonlyTupleOrArrayTypeNode,
  isReadonlyTupleTypeNode,
  isReadonlyTypeNode,
} from '../functions/index.mjs';
import { createTransformerFactory, printNode } from '../utils/index.mjs';
import {
  decrementIndexedAccessDepth,
  groupUnionIntersectionTypes,
  incrementIndexedAccessDepth,
  invalidDeepReadonlyTypeName,
  nextReadonlyContext,
  type ReadonlyContext,
} from './readonly-transformer-helpers/index.mjs';
import { debugPrintWrapper } from './test-utils.mjs';

// https://github.com/eslint-functional/eslint-plugin-functional/blob/main/src/rules/prefer-readonly-type.ts
// https://github.com/eslint-functional/eslint-plugin-functional/blob/main/tests/rules/prefer-readonly-type.test.ts

/**
 * Convert all types to readonly.
 *
 * - Mutable to readonly
 *   - `T[]` to `readonly T[]`
 *   - `Array<T>` to `readonly T[]`
 * - Normalize
 *   - `Readonly<Readonly<T>>` to `Readonly<T>`
 *   - `Readonly<T[]>` to `readonly T[]`
 *   - `Readonly<readonly T[]>` to `readonly T[]`
 *   - `Readonly<[T1, T2, T3]>` to `readonly [T1, T2, T3]`
 *   - `Readonly<readonly [T1, T2, T3]>` to `readonly [T1, T2, T3]`
 *   - `ReadonlyArray<T>` to `readonly T[]`
 *   - `ReadonlyArray<T>` to `readonly T[]`
 *   - `Readonly<A> & Readonly<B>` to `Readonly<A & B>`
 *   - `Readonly<A> | Readonly<B>` to `Readonly<A | B>`
 */
export const convertToReadonlyTypeTransformer = (
  options?: ReadonlyTransformerOptions,
): ts.TransformerFactory<ts.SourceFile> => {
  if (
    options?.DeepReadonly?.typeName !== undefined &&
    invalidDeepReadonlyTypeName.has(options.DeepReadonly.typeName)
  ) {
    throw new Error(
      `Invalid DeepReadonly typeName "${options.DeepReadonly.typeName}" passed to convertToReadonlyType`,
    );
  }

  const DeepReadonlyTypeName =
    options?.DeepReadonly?.typeName ?? 'DeepReadonly';

  const ignorePrefixes = ISet.new(options?.ignorePrefixes ?? ['mut_']);

  return createTransformerFactory((context) => {
    const visitor: ts.Visitor = (node: ts.Node): ts.VisitResult<ts.Node> =>
      transformNode(
        node,
        visitor,
        context,
        { type: 'none', indexedAccessDepth: 0 },
        {
          DeepReadonly: {
            typeName: DeepReadonlyTypeName,
            applyLevel: 'keep',
          },
          ignoreEmptyObjectTypes: options?.ignoreEmptyObjectTypes ?? true,
          ignoredPrefixes: ignorePrefixes,
        },
        0,
      );

    return visitor;
  });
};

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

type ReadonlyTransformerOptionsInternal = Readonly<{
  DeepReadonly: Readonly<{
    typeName: string;

    // removeAsPossible: 正規化後、 DeepReadonly の子ノードが typeLiteral かまたはその union or intersection であり、 それぞれの TypeLiteral がプリミティブ値のメンバーしか持たない場合。
    applyLevel: 'applyAgressively' | 'keep' | 'removeAsPossible';
  }>;

  ignoreEmptyObjectTypes: boolean;

  ignoredPrefixes: ISet<string>;
}>;

type TransformNodeFn = <N extends ts.Node>(
  node: N,
  visitor: ts.Visitor,
  context: ts.TransformationContext,
  readonlyContext: ReadonlyContext,
  options: ReadonlyTransformerOptionsInternal,
  depth: SafeUintWithSmallInt,
) => N extends ts.TypeReferenceNode
  ? N | ts.TypeNode
  : N extends ts.TypeLiteralNode
    ? N | ts.TypeReferenceNode
    : N extends ts.MappedTypeNode
      ? N | ts.TypeReferenceNode
      : N extends ts.ArrayTypeNode
        ? N | ts.TypeOperatorNode
        : N extends ts.TupleTypeNode
          ? N | ts.TypeOperatorNode
          : N extends ts.TypeOperatorNode
            ? ts.TypeNode
            : N extends ts.IntersectionTypeNode
              ? N | ts.TypeReferenceNode
              : N extends ts.UnionTypeNode
                ? N | ts.TypeReferenceNode
                : N extends ts.ParenthesizedTypeNode
                  ? ts.TypeNode
                  : N;
// NOTE: Cases where the node type changes are clearly indicated

/** Convert all nodes to readonly type (recursively) */
// eslint-disable-next-line total-functions/no-unsafe-type-assertion
const transformNode: TransformNodeFn = ((
  node,
  visitor,
  context,
  readonlyContext,
  options,
  depth,
) => {
  const readonlyContextMsg = `(readonlyContext = ${readonlyContext.type})`;

  console.debug(`transformNode\t[${ts.SyntaxKind[node.kind]}]`);
  console.debug(printNode(node));
  console.debug(readonlyContextMsg);
  console.debug();

  if (hasDisableNextLineComment(node)) {
    console.debug('skipped by disable-next-line comment');
    return node;
  }

  // check for ignorePrefix
  if (ts.isVariableDeclaration(node)) {
    const nodeName = node.name;

    expectType<typeof nodeName, ts.BindingName>('=');

    expectType<
      ts.BindingName,
      ts.Identifier | ts.ArrayBindingPattern | ts.ObjectBindingPattern
    >('=');

    if (
      ts.isIdentifier(nodeName) &&
      options.ignoredPrefixes.some((p) => nodeName.text.startsWith(p))
    ) {
      // Skip readonly conversion for variable declarations with ignored prefixes
      // Example: const mut_foo: string[] = []; -> remains as is, without readonly conversion
      return node;
    }

    // TODO: Support ignoredPrefixes in ArrayBindingPattern
    // if (ts.isArrayBindingPattern(nodeName)) {
    //   // for (const [i, el] of nodeName.elements.entries())
    // }

    // TODO: Support ignoredPrefixes in ObjectBindingPattern
    // if (ts.isObjectBindingPattern(nodeName)) {
    //   // for (const [i, el] of nodeName.elements.entries())
    // }
  }

  // Skip readonly conversion for function declarations with ignored prefixes
  // Example: function mut_foo() {} -> parameters and return types remain as is
  if (
    (ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node)) &&
    options.ignoredPrefixes.some(
      (p) =>
        (node.name satisfies ts.Identifier | undefined)?.text.startsWith(p) ===
        true,
    )
  ) {
    return node;
  }

  if (ts.isParameter(node)) {
    const nodeName = node.name;

    expectType<typeof nodeName, ts.BindingName>('=');

    expectType<
      ts.BindingName,
      ts.Identifier | ts.ArrayBindingPattern | ts.ObjectBindingPattern
    >('=');

    if (
      ts.isIdentifier(nodeName) &&
      options.ignoredPrefixes.some((p) => nodeName.text.startsWith(p))
    ) {
      // Skip readonly conversion for variable declarations with ignored prefixes
      // Example: const mut_foo: string[] = []; -> remains as is, without readonly conversion
      return node;
    }

    // TODO: Support ignoredPrefixes in ArrayBindingPattern
    // if (ts.isArrayBindingPattern(nodeName)) {
    // }

    // TODO: Support ignoredPrefixes in ObjectBindingPattern
    // if (ts.isObjectBindingPattern(nodeName)) {
    // }
  }

  // Skip readonly conversion for type alias declarations with ignored prefixes
  // Example: type mut_Foo = number[]; -> remains as number[] without readonly
  if (
    ts.isTypeAliasDeclaration(node) &&
    options.ignoredPrefixes.some((p) =>
      (node.name satisfies ts.Identifier).text.startsWith(p),
    )
  ) {
    return node;
  }

  if (ts.isTypeReferenceNode(node)) {
    if (readonlyContext.type === 'readonly') {
      throw new Error(
        'Invalid readonlyContext "readonly" passed to TypeReferenceNode',
      );
    }
    return debugPrintWrapper(
      'transformTypeReferenceNode',
      node,
      transformTypeReferenceNode(
        node,
        visitor,
        context,
        readonlyContext,
        options,
        depth,
      ),
      depth,
      readonlyContextMsg,
    );
  }

  if (ts.isTypeLiteralNode(node)) {
    if (readonlyContext.type === 'readonly') {
      throw new Error(
        'Invalid readonlyContext "readonly" passed to TypeReferenceNode',
      );
    }
    return debugPrintWrapper(
      'transformTypeLiteralNode',
      node,
      transformTypeLiteralNode(
        node,
        visitor,
        context,
        readonlyContext,
        options,
        depth,
      ),
      depth,
      readonlyContextMsg,
    );
  }

  if (ts.isMappedTypeNode(node)) {
    if (readonlyContext.type === 'readonly') {
      throw new Error(
        'Invalid readonlyContext "readonly" passed to MappedTypeNode',
      );
    }
    return debugPrintWrapper(
      'transformMappedTypeNode',
      node,
      transformMappedTypeNode(
        node,
        visitor,
        context,
        readonlyContext,
        options,
        depth,
      ),
      depth,
      readonlyContextMsg,
    );
  }

  if (ts.isInterfaceDeclaration(node)) {
    // Skip readonly conversion for interface declarations with ignored prefixes
    // Example: interface mut_Interface {...} -> properties remain without readonly
    if (
      options.ignoredPrefixes.some((p) =>
        (node.name satisfies ts.Identifier).text.startsWith(p),
      )
    ) {
      return node;
    }

    return debugPrintWrapper(
      'transformInterfaceDeclarationNode',
      node,
      transformInterfaceDeclarationNode(node, visitor, context, options, depth),
      depth,
      readonlyContextMsg,
    );
  }

  if (ts.isClassDeclaration(node)) {
    // Skip readonly conversion for class declarations with ignored prefixes
    // Example: class mut_Class {...} -> properties remain without readonly
    if (
      options.ignoredPrefixes.some(
        (p) =>
          (node.name satisfies ts.Identifier | undefined)?.text.startsWith(
            p,
          ) === true,
      )
    ) {
      return node;
    }

    return debugPrintWrapper(
      'transformClassDeclarationNode',
      node,
      transformClassDeclarationNode(node, visitor, context, options, depth),
      depth,
      readonlyContextMsg,
    );
  }

  if (ts.isArrayTypeNode(node)) {
    return debugPrintWrapper(
      'transformArrayTypeNode',
      node,
      transformArrayTypeNode(
        node,
        visitor,
        context,
        readonlyContext,
        options,
        depth,
      ),
      depth,
      readonlyContextMsg,
    );
  }

  if (ts.isTupleTypeNode(node)) {
    return debugPrintWrapper(
      'transformTupleTypeNode',
      node,
      transformTupleTypeNode(
        node,
        visitor,
        context,
        readonlyContext,
        options,
        depth,
      ),
      depth,
      readonlyContextMsg,
    );
  }

  if (ts.isRestTypeNode(node)) {
    return debugPrintWrapper(
      'transformRestTypeNode',
      node,
      transformRestTypeNode(
        node,
        visitor,
        context,
        readonlyContext,
        options,
        depth,
      ),
      depth,
      readonlyContextMsg,
    );
  }

  if (ts.isIndexedAccessTypeNode(node)) {
    return debugPrintWrapper(
      'transformIndexedAccessTypeNode',
      node,
      transformIndexedAccessTypeNode(
        node,
        visitor,
        context,
        readonlyContext,
        options,
        depth,
      ),
      depth,
      readonlyContextMsg,
    );
  }

  if (ts.isTypeOperatorNode(node)) {
    if (readonlyContext.type === 'readonly') {
      throw new Error(
        'Invalid readonlyContext "readonly" passed to TypeOperatorNode',
      );
    }
    return debugPrintWrapper(
      'transformTypeOperatorNode',
      node,
      transformTypeOperatorNode(
        node,
        visitor,
        context,
        readonlyContext,
        options,
        depth,
      ),
      depth,
      readonlyContextMsg,
    );
  }

  if (ts.isIntersectionTypeNode(node)) {
    if (readonlyContext.type === 'readonly') {
      throw new Error(
        'Invalid readonlyContext "readonly" passed to IntersectionTypeNode',
      );
    }
    return debugPrintWrapper(
      'transformIntersectionTypeNode',
      node,
      transformIntersectionTypeNode(
        node,
        visitor,
        context,
        readonlyContext,
        options,
        depth,
      ),
      depth,
      readonlyContextMsg,
    );
  }

  if (ts.isUnionTypeNode(node)) {
    if (readonlyContext.type === 'readonly') {
      throw new Error(
        'Invalid readonlyContext "readonly" passed to UnionTypeNode',
      );
    }
    return debugPrintWrapper(
      'transformUnionTypeNode',
      node,
      transformUnionTypeNode(
        node,
        visitor,
        context,
        readonlyContext,
        options,
        depth,
      ),
      depth,
      readonlyContextMsg,
    );
  }

  if (ts.isParenthesizedTypeNode(node)) {
    return debugPrintWrapper(
      'transformParenthesizedTypeNode',
      node,
      transformParenthesizedTypeNode(
        node,
        visitor,
        context,
        readonlyContext,
        options,
        depth,
      ),
      depth,
      readonlyContextMsg,
    );
  }

  console.debug('(recursion)');
  console.debug();

  return ts.visitEachChild(node, visitor, context);
}) as TransformNodeFn;

//
// Transformer implementation for each node type
//

// `{ readonly member: V } |-> Readonly<{ member: V }>`
const transformTypeLiteralNode = (
  node: ts.TypeLiteralNode,
  visitor: ts.Visitor,
  context: ts.TransformationContext,
  readonlyContext: Exclude<
    ReadonlyContext,
    Readonly<{ type: 'readonly'; indexedAccessDepth: number }>
  >,
  options: ReadonlyTransformerOptionsInternal,
  depth: SafeUintWithSmallInt,
): ts.TypeLiteralNode | ts.TypeReferenceNode => {
  if (options.ignoreEmptyObjectTypes && node.members.length === 0) {
    return node;
  }

  const newTypeLiteralNode = context.factory.updateTypeLiteralNode(
    node,
    // Recursive processing
    transformMembers(
      node.members,
      'remove',
      visitor,
      context,
      nextReadonlyContext(readonlyContext, {
        type: 'none',
        indexedAccessDepth: decrementIndexedAccessDepth(readonlyContext),
      }),
      options,
      SafeUint.add(1, depth),
    ),
  );

  switch (readonlyContext.type) {
    case 'DeepReadonly':
    case 'Readonly':
      // Don't wrap with Readonly if already readonly
      return newTypeLiteralNode;

    case 'none':
      // `{ readonly x: X, readonly y: Y } |-> Readonly<{ x: X, y: Y }>`
      return readonlyContext.indexedAccessDepth > 0
        ? newTypeLiteralNode
        : createReadonlyTypeNode(newTypeLiteralNode, context);
  }
};

// Making interface members readonly
const transformInterfaceDeclarationNode = (
  node: ts.InterfaceDeclaration,
  visitor: ts.Visitor,
  context: ts.TransformationContext,
  options: ReadonlyTransformerOptionsInternal,
  depth: SafeUintWithSmallInt,
): ts.InterfaceDeclaration =>
  context.factory.updateInterfaceDeclaration(
    node,
    node.modifiers,
    node.name,
    node.typeParameters?.map((n) =>
      transformNode(
        n,
        visitor,
        context,
        { type: 'none', indexedAccessDepth: 0 },
        options,
        SafeUint.add(1, depth),
      ),
    ),
    node.heritageClauses?.map((n) =>
      transformNode(
        n,
        visitor,
        context,
        { type: 'none', indexedAccessDepth: 0 },
        options,
        SafeUint.add(1, depth),
      ),
    ),
    transformMembers(
      node.members,
      'add',
      visitor,
      context,
      { type: 'none', indexedAccessDepth: 0 },
      options,
      SafeUint.add(1, depth),
    ),
  );

const transformClassDeclarationNode = (
  node: ts.ClassDeclaration,
  visitor: ts.Visitor,
  context: ts.TransformationContext,
  options: ReadonlyTransformerOptionsInternal,
  depth: SafeUintWithSmallInt,
): ts.ClassDeclaration =>
  context.factory.updateClassDeclaration(
    node,
    node.modifiers,
    node.name,
    node.typeParameters?.map((n) =>
      transformNode(
        n,
        visitor,
        context,
        { type: 'none', indexedAccessDepth: 0 },
        options,
        SafeUint.add(1, depth),
      ),
    ),
    node.heritageClauses?.map((n) =>
      transformNode(
        n,
        visitor,
        context,
        { type: 'none', indexedAccessDepth: 0 },
        options,
        SafeUint.add(1, depth),
      ),
    ),
    node.members.map((mb: ts.ClassElement): ts.ClassElement => {
      if (hasDisableNextLineComment(mb)) {
        console.debug('skipped by disable-next-line comment');
        return mb;
      }

      if (options.ignoredPrefixes.size > 0) {
        const mbName = mb.name satisfies ts.PropertyName | undefined;

        expectType<
          ts.PropertyName,
          | ts.Identifier // mut_x: number[]
          | ts.StringLiteral // "mut_x": number[]
          | ts.NumericLiteral // skip
          | ts.BigIntLiteral // skip
          | ts.PrivateIdentifier // #memberName: number[]
          | ts.ComputedPropertyName // [`mut_x`]: number[]
          | ts.NoSubstitutionTemplateLiteral // invalid syntax
        >('=');

        if (
          mbName !== undefined &&
          (ts.isIdentifier(mbName) || ts.isStringLiteral(mbName)) &&
          options.ignoredPrefixes.some((p) => mbName.text.startsWith(p))
        ) {
          return mb;
        }

        if (
          mbName !== undefined &&
          ts.isPrivateIdentifier(mbName) &&
          options.ignoredPrefixes.some((p) => mbName.text.startsWith(`#${p}`))
        ) {
          return mb;
        }

        if (mbName !== undefined && ts.isComputedPropertyName(mbName)) {
          const child = mbName.expression;
          if (ts.isStringLiteralLike(child)) {
            options.ignoredPrefixes.some((p) => child.text.startsWith(p));
          }
          return mb;
        }
      }

      if (ts.isPropertyDeclaration(mb)) {
        return context.factory.updatePropertyDeclaration(
          mb,
          addReadonlyToModifiers(mb.modifiers, context),
          mb.name,
          mb.questionToken,
          mapOptional(mb.type, (n) =>
            transformNode(
              n,
              visitor,
              context,
              { type: 'none', indexedAccessDepth: 0 },
              options,
              SafeUint.add(1, depth),
            ),
          ),
          mb.initializer,
        );
      }
      if (ts.isIndexSignatureDeclaration(mb)) {
        return transformIndexSignatureDeclaration(
          mb,
          'add',
          visitor,
          context,
          { type: 'none', indexedAccessDepth: 0 },
          options,
          SafeUint.add(1, depth),
        );
      }
      if (ts.isConstructorDeclaration(mb)) {
        return context.factory.updateConstructorDeclaration(
          mb,
          mb.modifiers,
          mb.parameters.map((n) => {
            const nodeName = n.name;

            expectType<typeof nodeName, ts.BindingName>('=');

            expectType<
              ts.BindingName,
              ts.Identifier | ts.ArrayBindingPattern | ts.ObjectBindingPattern
            >('=');

            if (
              ts.isIdentifier(nodeName) &&
              options.ignoredPrefixes.some((p) => nodeName.text.startsWith(p))
            ) {
              return n;
            }

            return context.factory.updateParameterDeclaration(
              n,
              pipe(removeReadonlyFromModifiers(n.modifiers) ?? []).chain(
                (modifiers) =>
                  modifiers.length === 0
                    ? modifiers
                    : // public -> public readonly
                      // protected -> protected readonly
                      // private -> private readonly
                      addReadonlyToModifiers(modifiers, context),
              ).value,
              n.dotDotDotToken,
              n.name,
              n.questionToken,
              mapOptional(n.type, (t) =>
                transformNode(
                  t,
                  visitor,
                  context,
                  { type: 'none', indexedAccessDepth: 0 },
                  options,
                  SafeUint.add(1, depth),
                ),
              ),
              n.initializer,
            );
          }),
          mapOptional(mb.body, (body) =>
            ts.visitEachChild(body, visitor, context),
          ),
        );
      }

      return transformNode(
        mb,
        visitor,
        context,
        { type: 'none', indexedAccessDepth: 0 },
        options,
        SafeUint.add(1, depth),
      );
    }),
  );

/**
 * - `tr(ReadonlyArray<E>) |-> readonly tr(E)[]`
 * - `tr(Readonly<Readonly<E>>) |-> Readonly<tr(E)>`
 * - `tr(DeepReadonly<Readonly<E>>) |-> DeepReadonly<tr(E)>`
 * - `tr(Readonly<number>) |-> number`
 * - `tr(Readonly<E[]>) |-> readonly tr(E)[]`
 * - `tr(Readonly<[E1, E2, E3]>) |-> readonly [tr(E1), tr(E2), tr(E3)]`
 * - `tr(Readonly<readonly E[]>) |-> readonly tr(E)[]`
 * - `tr(Readonly<readonly [E1, E2, E3]>) |-> readonly [tr(E1), tr(E2), tr(E3)]`
 * - `tr(Readonly<A | readonly E[]>) |-> Readonly<tr(A)> | readonly tr(E)[]>`
 */
const transformTypeReferenceNode = (
  node: ts.TypeReferenceNode,
  visitor: ts.Visitor,
  context: ts.TransformationContext,
  readonlyContext: Exclude<
    ReadonlyContext,
    Readonly<{ indexedAccessDepth: number; type: 'readonly' }>
  >,
  options: ReadonlyTransformerOptionsInternal,
  depth: SafeUintWithSmallInt,
): ts.TypeNode => {
  expectType<
    typeof node.typeName.kind,
    ts.SyntaxKind.Identifier | ts.SyntaxKind.QualifiedName
  >('=');

  if (node.typeName.kind === ts.SyntaxKind.Identifier) {
    const typeArguments =
      node.typeArguments ?? context.factory.createNodeArray([]);

    const typeNameStr = node.typeName.text;

    // Array<T> / ReadonlyArray<T> to readonly T[]
    if (typeNameStr === 'Array' || typeNameStr === 'ReadonlyArray') {
      if (!Arr.isArrayOfLength1(typeArguments)) {
        throw new Error(
          `Unexpected number of type arguments "${typeArguments.length}" for ${typeNameStr}.`,
        );
      }

      // Recursive processing
      const T = transformNode(
        typeArguments[0],
        visitor,
        context,
        {
          type: 'none',
          indexedAccessDepth: readonlyContext.indexedAccessDepth,
        },
        options,
        SafeUint.add(1, depth),
      );

      return readonlyContext.type === 'DeepReadonly'
        ? context.factory.createArrayTypeNode(T)
        : createReadonlyArrayTypeNode(T, context);
    }

    // Set<T> to ReadonlySet<T>
    if (typeNameStr === 'Set') {
      if (!Arr.isArrayOfLength1(typeArguments)) {
        throw new Error(
          `Unexpected number of type arguments "${typeArguments.length}" for Set.`,
        );
      }

      return context.factory.updateTypeReferenceNode(
        node,
        context.factory.createIdentifier('ReadonlySet'),
        context.factory.createNodeArray([
          transformNode(
            typeArguments[0],
            visitor,
            context,
            nextReadonlyContext(readonlyContext, {
              type: 'none',
              indexedAccessDepth: readonlyContext.indexedAccessDepth,
            }),
            options,
            SafeUint.add(1, depth),
          ),
        ]),
      );
    }

    // Map<T> to ReadonlyMap<T>
    if (typeNameStr === 'Map') {
      if (!Arr.isArrayOfLength2(typeArguments)) {
        throw new Error(
          `Unexpected number of type arguments "${typeArguments.length}" for Map.`,
        );
      }

      return context.factory.updateTypeReferenceNode(
        node,
        context.factory.createIdentifier('ReadonlyMap'),
        context.factory.createNodeArray(
          typeArguments.map((a) =>
            transformNode(
              a,
              visitor,
              context,
              nextReadonlyContext(readonlyContext, {
                type: 'none',
                indexedAccessDepth: 0, // Check this
              }),
              options,
              SafeUint.add(1, depth),
            ),
          ),
        ),
      );
    }

    // remove unnecessary `Readonly` wrapper or convert to readonly operator
    if (typeNameStr === 'Readonly') {
      if (!Arr.isArrayOfLength1(typeArguments)) {
        throw new Error(
          `Unexpected number of type arguments "${typeArguments.length}" for Readonly.`,
        );
      }

      // Recursive processing
      const T = transformNode(
        typeArguments[0],
        visitor,
        context,
        nextReadonlyContext(readonlyContext, {
          type: 'Readonly',
          indexedAccessDepth: readonlyContext.indexedAccessDepth,
        }),
        options,
        SafeUint.add(1, depth),
      );

      // Readonly<Readonly<T>> -> Readonly<T>
      // DeepReadonly<Readonly<T>> -> DeepReadonly<T>
      if (
        readonlyContext.type === 'DeepReadonly' ||
        readonlyContext.type === 'Readonly' ||
        readonlyContext.indexedAccessDepth > 0
      ) {
        return T;
      }

      // Readonly<number> -> number
      if (isPrimitiveTypeNode(T)) {
        return T;
      }

      // T = E[]
      // Readonly<E[]> -> readonly E[]
      //
      // T = [E1, E2, E3]
      // Readonly<[E1, E2, E3]> -> readonly [E1, E2, E3]
      if (ts.isArrayTypeNode(T) || ts.isTupleTypeNode(T)) {
        return createReadonlyTypeOperatorNode(T, context);
      }

      // T = readonly E[] or readonly [E1, E2, E3]
      // Readonly<readonly E[]> -> readonly E[]
      // Readonly<readonly [E1, E2, E3]> -> readonly [E1, E2, E3]
      if (isReadonlyTupleOrArrayTypeNode(T)) {
        return T;
      }

      // T = A | B | C
      // T = A & B & C
      if (ts.isUnionTypeNode(T) || ts.isIntersectionTypeNode(T)) {
        const { primitives, arraysAndTuples, typeLiterals, others } =
          groupUnionIntersectionTypes(T.types);

        console.debug({ primitives, arraysAndTuples, typeLiterals, others });

        const readonlyTypeLiterals =
          typeLiterals === undefined
            ? []
            : [
                createReadonlyTypeNode(
                  ts.isIntersectionTypeNode(T)
                    ? context.factory.createIntersectionTypeNode(
                        typeLiterals.nodes,
                      )
                    : context.factory.createUnionTypeNode(typeLiterals.nodes),
                  context,
                ),
              ];

        // Sort by first occurrence (preserving the original union order as much as possible)
        const sorted = [
          [
            primitives?.nodes ?? [],
            primitives?.firstPosition ?? Number.POSITIVE_INFINITY,
          ] as const,
          [
            arraysAndTuples?.nodes ?? [],
            arraysAndTuples?.firstPosition ?? Number.POSITIVE_INFINITY,
          ] as const,
          [
            readonlyTypeLiterals,
            typeLiterals?.firstPosition ?? Number.POSITIVE_INFINITY,
          ] as const,
          [
            others?.nodes ?? [],
            others?.firstPosition ?? Number.POSITIVE_INFINITY,
          ] as const,
        ]
          .toSorted((a, b) => a[1] - b[1])
          .flatMap((a) => a[0]);

        const nodeArray = context.factory.createNodeArray(sorted);

        // Readonly<number & { x: X } & { y: Y } & readonly E[]>
        // -> number & readonly E[] & Readonly<{ x: X } & { y: Y }>

        // Readonly<number | { x: X } | { y: Y } | readonly E[]>
        // -> number | readonly E[] | Readonly<{ x: X } | { y: Y }>
        return ts.isIntersectionTypeNode(T)
          ? context.factory.updateIntersectionTypeNode(T, nodeArray)
          : context.factory.updateUnionTypeNode(T, nodeArray);
      }

      return context.factory.updateTypeReferenceNode(
        node,
        node.typeName,
        context.factory.createNodeArray([T]),
      );
    }

    // DeepReadonly
    if (typeNameStr === options.DeepReadonly.typeName) {
      if (!Arr.isArrayOfLength1(typeArguments)) {
        throw new Error(
          `Unexpected number of type arguments "${typeArguments.length}" for Readonly.`,
        );
      }

      // Recursive processing
      const T = transformNode(
        typeArguments[0],
        visitor,
        context,
        nextReadonlyContext(readonlyContext, {
          type: 'DeepReadonly',
          indexedAccessDepth: Number.POSITIVE_INFINITY,
        }),
        options,
        SafeUint.add(1, depth),
      );

      // DeepReadonly<DeepReadonly<T>> -> DeepReadonly<T>
      if (readonlyContext.type === 'DeepReadonly') {
        return T;
      }

      // Readonly<number> -> number
      if (isPrimitiveTypeNode(T)) {
        return T;
      }

      // T = P[]
      // DeepReadonly<P[]> -> readonly P[] (for primitive type arrays, convert to readonly P[] form)
      // DeepReadonly<O[]> -> DeepReadonly<O[]> (for object type arrays, keep as is to recursively apply Readonly)
      // DeepReadonly<P[][]> -> DeepReadonly<P[][]>
      if (ts.isArrayTypeNode(T) && isPrimitiveTypeNode(T.elementType)) {
        return createReadonlyTypeOperatorNode(T, context);
      }

      // T = [P1, P2, P3]
      // DeepReadonly<[P1, P2, P3]> -> readonly [P1, P2, P3]
      if (ts.isTupleTypeNode(T) && T.elements.every(isPrimitiveTypeNode)) {
        return createReadonlyTypeOperatorNode(T, context);
      }

      // T = A | B | C
      // T = A & B & C
      if (ts.isUnionTypeNode(T) || ts.isIntersectionTypeNode(T)) {
        const { primitives, arraysAndTuples, typeLiterals, others } =
          groupUnionIntersectionTypes(T.types);

        const readonlyTypeLiterals =
          typeLiterals === undefined
            ? []
            : [
                context.factory.createTypeReferenceNode(
                  context.factory.createIdentifier(
                    options.DeepReadonly.typeName,
                  ),
                  [
                    createReadonlyTypeNode(
                      ts.isIntersectionTypeNode(T)
                        ? context.factory.createIntersectionTypeNode(
                            typeLiterals.nodes,
                          )
                        : context.factory.createUnionTypeNode(
                            typeLiterals.nodes,
                          ),
                      context,
                    ),
                  ],
                ),
              ];

        // Sort by first occurrence (preserving the original union order as much as possible)
        const sorted = [
          [
            primitives?.nodes ?? [],
            primitives?.firstPosition ?? Number.POSITIVE_INFINITY,
          ] as const,
          [
            arraysAndTuples?.nodes ?? [],
            arraysAndTuples?.firstPosition ?? Number.POSITIVE_INFINITY,
          ] as const,
          [
            readonlyTypeLiterals,
            typeLiterals?.firstPosition ?? Number.POSITIVE_INFINITY,
          ] as const,
          [
            others?.nodes ?? [],
            others?.firstPosition ?? Number.POSITIVE_INFINITY,
          ] as const,
        ]
          .toSorted((a, b) => a[1] - b[1])
          .flatMap((a) => a[0]);

        const nodeArray = context.factory.createNodeArray(sorted);

        // Readonly<number & { x: X } & { y: Y } & readonly E[]>
        // -> number & readonly E[] & Readonly<{ x: X } & { y: Y }>

        // Readonly<number | { x: X } | { y: Y } | readonly E[]>
        // -> number | readonly E[] | Readonly<{ x: X } | { y: Y }>
        return ts.isIntersectionTypeNode(T)
          ? context.factory.updateIntersectionTypeNode(T, nodeArray)
          : context.factory.updateUnionTypeNode(T, nodeArray);
      }

      return context.factory.updateTypeReferenceNode(
        node,
        node.typeName,
        context.factory.createNodeArray([T]),
      );
    }
  }

  // Recursive processing
  const newTypeArguments = context.factory.createNodeArray(
    node.typeArguments?.map((n) =>
      transformNode(
        n,
        visitor,
        context,
        {
          type: 'none',
          indexedAccessDepth: readonlyContext.indexedAccessDepth,
        },
        options,
        SafeUint.add(1, depth),
      ),
    ) ?? [],
  );

  return context.factory.updateTypeReferenceNode(
    node,
    node.typeName,
    newTypeArguments,
  );
};

/** `tr(E[]) |-> tr(E)[]` */
const transformArrayTypeNode = (
  node: ts.ArrayTypeNode,
  visitor: ts.Visitor,
  context: ts.TransformationContext,
  readonlyContext: ReadonlyContext,
  options: ReadonlyTransformerOptionsInternal,
  depth: SafeUintWithSmallInt,
): ts.ArrayTypeNode | ts.TypeOperatorNode => {
  // Recursive processing
  const E = transformNode(
    node.elementType,
    visitor,
    context,
    nextReadonlyContext(readonlyContext, {
      type: 'none',
      indexedAccessDepth: decrementIndexedAccessDepth(readonlyContext),
    }),
    options,
    SafeUint.add(1, depth),
  );

  const nextElement = context.factory.updateArrayTypeNode(node, E);

  switch (readonlyContext.type) {
    case 'DeepReadonly':
    case 'readonly':
      return nextElement;

    case 'Readonly':
    case 'none':
      return readonlyContext.indexedAccessDepth > 0
        ? nextElement
        : createReadonlyTypeOperatorNode(nextElement, context);
  }
};

/** `tr([E1, E2, E3])` |-> `[tr(E1), tr(E2), tr(E3)]` */
const transformTupleTypeNode = (
  node: ts.TupleTypeNode,
  visitor: ts.Visitor,
  context: ts.TransformationContext,
  readonlyContext: ReadonlyContext,
  options: ReadonlyTransformerOptionsInternal,
  depth: SafeUintWithSmallInt,
): ts.TupleTypeNode | ts.TypeOperatorNode => {
  // Recursive processing
  const Es = node.elements.map((el) =>
    ts.isNamedTupleMember(el)
      ? context.factory.updateNamedTupleMember(
          el,
          undefined,
          el.name,
          undefined,
          transformNode(
            el.type,
            visitor,
            context,
            nextReadonlyContext(readonlyContext, {
              type: 'none',
              indexedAccessDepth: decrementIndexedAccessDepth(readonlyContext),
            }),
            options,
            SafeUint.add(1, depth),
          ),
        )
      : transformNode(
          el,
          visitor,
          context,
          nextReadonlyContext(readonlyContext, {
            type: 'none',
            indexedAccessDepth: decrementIndexedAccessDepth(readonlyContext),
          }),
          options,
          SafeUint.add(1, depth),
        ),
  );

  const nextElements = context.factory.updateTupleTypeNode(node, Es);

  switch (readonlyContext.type) {
    case 'DeepReadonly':
    case 'readonly':
      return nextElements;

    case 'Readonly':
    case 'none':
      return readonlyContext.indexedAccessDepth > 0
        ? nextElements
        : createReadonlyTypeOperatorNode(nextElements, context);
  }
};

/** `tr("...T")` |-> `...tr(T)` */
const transformRestTypeNode = (
  node: ts.RestTypeNode,
  visitor: ts.Visitor,
  context: ts.TransformationContext,
  readonlyContext: ReadonlyContext,
  options: ReadonlyTransformerOptionsInternal,
  depth: SafeUintWithSmallInt,
): ts.RestTypeNode => {
  // Recursive processing
  const R = transformNode(
    node.type /* = T */,
    visitor,
    context,
    nextReadonlyContext(readonlyContext, {
      type: 'none',
      indexedAccessDepth: decrementIndexedAccessDepth(readonlyContext),
    }),
    options,
    SafeUint.add(1, depth),
  );

  // `tr("...readonly E[]") |-> ...tr(E)[]`
  // `tr("...readonly [E1, E2]") |-> ...[tr(E1), tr(E2)]`
  if (isReadonlyArrayTypeNode(R) || isReadonlyTupleTypeNode(R)) {
    return context.factory.updateRestTypeNode(
      node,
      R.type /* = tr(E)[] or [tr(E1), tr(E2)] */,
    );
  }

  return context.factory.updateRestTypeNode(node, R);
};

/** `tr([A, B, C][I])` |-> `[tr(A), tr(B), tr(C)][I]` */
const transformIndexedAccessTypeNode = (
  node: ts.IndexedAccessTypeNode,
  visitor: ts.Visitor,
  context: ts.TransformationContext,
  readonlyContext: ReadonlyContext,
  options: ReadonlyTransformerOptionsInternal,
  depth: SafeUintWithSmallInt,
): ts.IndexedAccessTypeNode => {
  // Recursive processing
  const O /* = A, B, C */ = transformNode(
    node.objectType,
    visitor,
    context,
    nextReadonlyContext(readonlyContext, {
      type: 'none',
      indexedAccessDepth: incrementIndexedAccessDepth(readonlyContext),
    }),
    options,
    SafeUint.add(1, depth),
  );

  const I = transformNode(
    node.indexType /* = I */,
    visitor,
    context,
    {
      type:
        readonlyContext.type === 'DeepReadonly' ? 'DeepReadonly' : 'Readonly',
      indexedAccessDepth: decrementIndexedAccessDepth(readonlyContext),
    },
    options,
    SafeUint.add(1, depth),
  );

  return context.factory.updateIndexedAccessTypeNode(node, O, I);
};

/**
 * - `readonly T[][] |-> readonly (readonly T[])[]`
 * - `keyof { a: number[] } |-> keyof Readonly<{ a: readonly number[] }>`
 */
const transformTypeOperatorNode = (
  node: ts.TypeOperatorNode,
  visitor: ts.Visitor,
  context: ts.TransformationContext,
  readonlyContext: Exclude<
    ReadonlyContext,
    Readonly<{ type: 'readonly'; indexedAccessDepth: number }>
  >,
  options: ReadonlyTransformerOptionsInternal,
  depth: SafeUintWithSmallInt,
): ts.TypeNode => {
  // Recursive processing
  const newType = transformNode(
    node.type,
    visitor,
    context,
    nextReadonlyContext(readonlyContext, {
      type:
        node.operator === ts.SyntaxKind.ReadonlyKeyword ? 'readonly' : 'none',
      indexedAccessDepth: decrementIndexedAccessDepth(readonlyContext),
    }),
    options,
    SafeUint.add(1, depth),
  );

  switch (readonlyContext.type) {
    // DeepReadonly<readonly E[]> -> DeepReadonly<E[]>
    case 'DeepReadonly':
      return newType;

    case 'Readonly':
    case 'none':
      return readonlyContext.indexedAccessDepth > 0
        ? newType
        : context.factory.updateTypeOperatorNode(node, newType);
  }
};

/**
 * - `{ [key in Obj]: V }` -> `Readonly<{ [key in Obj]: V }>`
 * - `{ -readonly [key in Obj]: V }` -> `Readonly<{ [key in Obj]: V }>`
 * - `{ readonly [key in Obj]: V }` -> `Readonly<{ [key in Obj]: V }>`
 * - `{ +readonly [key in Obj]: V }` -> `Readonly<{ [key in Obj]: V }>`
 */
const transformMappedTypeNode = (
  node: ts.MappedTypeNode,
  visitor: ts.Visitor,
  context: ts.TransformationContext,
  readonlyContext: Exclude<
    ReadonlyContext,
    Readonly<{ type: 'readonly'; indexedAccessDepth: number }>
  >,
  options: ReadonlyTransformerOptionsInternal,
  depth: SafeUintWithSmallInt,
): ts.MappedTypeNode | ts.TypeReferenceNode => {
  const newMappedTypeNode = context.factory.updateMappedTypeNode(
    node,
    undefined, // remove readonlyToken
    node.typeParameter,
    node.nameType,
    node.questionToken,
    mapOptional(node.type, (n) =>
      transformNode(
        n,
        visitor,
        context,
        nextReadonlyContext(readonlyContext, {
          type: 'none',
          indexedAccessDepth: decrementIndexedAccessDepth(readonlyContext),
        }),
        options,
        SafeUint.add(1, depth),
      ),
    ),
    node.members,
  );

  switch (readonlyContext.type) {
    case 'DeepReadonly':
    case 'Readonly':
      // Don't wrap with Readonly if already readonly or unnecessary
      return newMappedTypeNode;

    case 'none':
      return readonlyContext.indexedAccessDepth > 0
        ? newMappedTypeNode
        : createReadonlyTypeNode(newMappedTypeNode, context);
  }
};

/**
 * - `tr(A & B) -> tr(A) & tr(B)`
 * - `tr(Readonly<A> & Readonly<B>) -> Readonly<tr(A) & tr(B)>`
 */
const transformIntersectionTypeNode = (
  node: ts.IntersectionTypeNode,
  visitor: ts.Visitor,
  context: ts.TransformationContext,
  readonlyContext: Exclude<
    ReadonlyContext,
    Readonly<{ type: 'readonly'; indexedAccessDepth: number }>
  >,
  options: ReadonlyTransformerOptionsInternal,
  depth: SafeUintWithSmallInt,
): ts.IntersectionTypeNode | ts.TypeReferenceNode => {
  // Recursive processing
  const newTypes = node.types /* = [A, B] */
    .map((n) =>
      transformNode(
        n,
        visitor,
        context,
        readonlyContext,
        options,
        SafeUint.add(1, depth),
      ),
    );

  // MEMO: When readonlyContext == Readonly, newTypes are converted to mutable types.
  // Readonly<*> & ... & Readonly<*> can be passed directly.

  if (newTypes.every(isReadonlyTypeNode)) {
    // Readonly<*> & ... & Readonly<*>
    const args = context.factory.createNodeArray(
      newTypes.map((type) => type.typeArguments[0]),
    );

    if (readonlyContext.type !== 'none') {
      throw new Error(
        `readonlyContext cannot be "${readonlyContext.type}" if all newTypes are ReadonlyTypeNode`,
      );
    }

    return createReadonlyTypeNode(
      context.factory.updateIntersectionTypeNode(node, args),
      context,
    );
  }

  return context.factory.updateIntersectionTypeNode(
    node,
    context.factory.createNodeArray(newTypes),
  );
};

/**
 * - `tr(A | B) |-> tr(A) | tr(B)`
 * - `tr(Readonly<A> | Readonly<B>) |-> Readonly<tr(A) | tr(B)>`
 */
const transformUnionTypeNode = (
  node: ts.UnionTypeNode,
  visitor: ts.Visitor,
  context: ts.TransformationContext,
  readonlyContext: Exclude<
    ReadonlyContext,
    Readonly<{ type: 'readonly'; indexedAccessDepth: number }>
  >,
  options: ReadonlyTransformerOptionsInternal,
  depth: SafeUintWithSmallInt,
): ts.UnionTypeNode | ts.TypeReferenceNode => {
  // Recursive processing
  const newTypes = node.types /* = [A, B] */
    .map((n) =>
      transformNode(
        n,
        visitor,
        context,
        readonlyContext,
        options,
        SafeUint.add(1, depth),
      ),
    );

  // MEMO: When readonlyContext == Readonly, newTypes are converted to mutable types.
  // Readonly<*> | ... | Readonly<*> can be passed directly.

  if (newTypes.every(isReadonlyTypeNode)) {
    // Readonly<*> | ... | Readonly<*>
    const args = context.factory.createNodeArray(
      newTypes.map((type) => type.typeArguments[0]),
    );

    if (readonlyContext.type !== 'none') {
      throw new Error(
        `readonlyContext cannot be "${readonlyContext.type}" if all newTypes are ReadonlyTypeNode`,
      );
    }

    return createReadonlyTypeNode(
      context.factory.updateUnionTypeNode(node, args),
      context,
    );
  }

  return context.factory.updateUnionTypeNode(
    node,
    context.factory.createNodeArray(newTypes),
  );
};

/** Convert ((T)) -> (T) recursively */
const transformParenthesizedTypeNode = (
  node: ts.ParenthesizedTypeNode,
  visitor: ts.Visitor,
  context: ts.TransformationContext,
  readonlyContext: ReadonlyContext,
  options: ReadonlyTransformerOptionsInternal,
  depth: SafeUintWithSmallInt,
): ts.TypeNode => {
  if (ts.isParenthesizedTypeNode(node.type)) {
    // Recursive processing
    return transformParenthesizedTypeNode(
      node.type,
      visitor,
      context,
      readonlyContext,
      options,
      SafeUint.add(1, depth),
    );
  }

  const T = transformNode(
    node.type,
    visitor,
    context,
    readonlyContext,
    options,
    SafeUint.add(1, depth),
  );

  // remove () if T is TypeReferenceNode
  // e.g. `(Readonly<A>) |-> Readonly<A>`
  if (ts.isTypeReferenceNode(T)) return T;

  // remove () if T is TypeOperatorNode
  // e.g. `(readonly A[]) |-> readonly A[]`
  if (ts.isTypeOperatorNode(T)) return T;

  // remove () if T is ArrayTypeNode
  // e.g. `(A[]) |-> A[]`
  if (ts.isArrayTypeNode(T)) return T;

  // remove () if T is TupleTypeNode
  // e.g. `([A]) |-> [A]`
  if (ts.isTupleTypeNode(T)) return T;

  // remove () if T is PrimitiveTypeNode
  // e.g. `(number) |-> number`
  if (isPrimitiveTypeNode(T)) return T;

  // remove () if T is TypeLiteralNode
  // e.g. `({ member: V }) |-> { member: V }`
  if (ts.isTypeLiteralNode(T)) return T;

  // otherwise, keep ()
  return context.factory.updateParenthesizedType(node, T);
};

/**
 * `tr(["member1: V1", "member2: V2", "member3: V3"])`
 *
 * -> `["member1: tr(V1)", "member2: tr(V2)", "member3: tr(V3)"]`
 */
const transformMembers = (
  members: ts.NodeArray<ts.TypeElement>,
  readonlyModifier: 'add' | 'remove',
  visitor: ts.Visitor,
  context: ts.TransformationContext,
  readonlyContext: Extract<
    ReadonlyContext,
    Readonly<{ type: 'DeepReadonly' | 'none'; indexedAccessDepth: number }>
  >,
  options: ReadonlyTransformerOptionsInternal,
  depth: SafeUintWithSmallInt,
): ts.NodeArray<ts.TypeElement> =>
  context.factory.createNodeArray(
    members.map((mb) => {
      if (hasDisableNextLineComment(mb)) {
        console.debug('skipped by disable-next-line comment');
        return mb;
      }

      if (options.ignoredPrefixes.size > 0) {
        const mbName = mb.name satisfies ts.PropertyName | undefined;

        expectType<
          ts.PropertyName,
          | ts.Identifier // mut_x: number[]
          | ts.StringLiteral // "mut_x": number[]
          | ts.NumericLiteral // skip
          | ts.BigIntLiteral // skip
          | ts.PrivateIdentifier // #memberName: number[] (class only)
          | ts.ComputedPropertyName // [`mut_x`]: number[]
          | ts.NoSubstitutionTemplateLiteral // invalid syntax
        >('=');

        if (
          mbName !== undefined &&
          (ts.isIdentifier(mbName) || ts.isStringLiteral(mbName)) &&
          options.ignoredPrefixes.some((p) => mbName.text.startsWith(p))
        ) {
          return mb;
        }

        if (mbName !== undefined && ts.isComputedPropertyName(mbName)) {
          const child = mbName.expression;
          if (
            ts.isStringLiteralLike(child) &&
            options.ignoredPrefixes.some((p) => child.text.startsWith(p))
          ) {
            return mb;
          }
        }
      }

      if (ts.isPropertySignature(mb)) {
        return transformPropertySignature(
          mb,
          readonlyModifier,
          visitor,
          context,
          readonlyContext,
          options,
          SafeUint.add(1, depth),
        );
      }
      if (ts.isIndexSignatureDeclaration(mb)) {
        return transformIndexSignatureDeclaration(
          mb,
          readonlyModifier,
          visitor,
          context,
          readonlyContext,
          options,
          SafeUint.add(1, depth),
        );
      }

      return transformNode(
        mb,
        visitor,
        context,
        readonlyContext,
        options,
        SafeUint.add(1, depth),
      );
    }),
    members.hasTrailingComma,
  );

const transformPropertySignature = (
  node: ts.PropertySignature,
  readonlyModifier: 'add' | 'remove',
  visitor: ts.Visitor,
  context: ts.TransformationContext,
  readonlyContext: Extract<
    ReadonlyContext,
    Readonly<{ type: 'DeepReadonly' | 'none'; indexedAccessDepth: number }>
  >,
  options: ReadonlyTransformerOptionsInternal,
  depth: SafeUintWithSmallInt,
): ts.PropertySignature =>
  context.factory.updatePropertySignature(
    node,
    strictMatch(
      readonlyContext.type === 'DeepReadonly' ? 'remove' : readonlyModifier,
      {
        add: addReadonlyToModifiers(node.modifiers, context),
        remove: removeReadonlyFromModifiers(node.modifiers),
      },
    ),
    node.name,
    node.questionToken,
    mapOptional(node.type, (t) =>
      transformNode(
        t,
        visitor,
        context,
        readonlyContext,
        options,
        SafeUint.add(1, depth),
      ),
    ),
  );

const transformIndexSignatureDeclaration = (
  node: ts.IndexSignatureDeclaration,
  readonlyModifier: 'add' | 'remove',
  visitor: ts.Visitor,
  context: ts.TransformationContext,
  readonlyContext: Extract<
    ReadonlyContext,
    Readonly<{ type: 'DeepReadonly' | 'none'; indexedAccessDepth: number }>
  >,
  options: ReadonlyTransformerOptionsInternal,
  depth: SafeUintWithSmallInt,
): ts.IndexSignatureDeclaration =>
  context.factory.updateIndexSignature(
    node,
    strictMatch(
      readonlyContext.type === 'DeepReadonly' ? 'remove' : readonlyModifier,
      {
        add: addReadonlyToModifiers(node.modifiers, context),
        remove: removeReadonlyFromModifiers(node.modifiers),
      },
    ),
    node.parameters.map((n) =>
      transformNode(
        n,
        visitor,
        context,
        readonlyContext,
        options,
        SafeUint.add(1, depth),
      ),
    ),
    transformNode(
      node.type,
      visitor,
      context,
      readonlyContext,
      options,
      SafeUint.add(1, depth),
    ),
  );

const removeReadonlyFromModifiers = <M extends ts.ModifierLike>(
  modifiers: ts.NodeArray<M> | undefined,
): readonly M[] | undefined =>
  modifiers?.filter((m) => !ts.isReadonlyKeywordOrPlusOrMinusToken(m));

const addReadonlyToModifiers = <M extends ts.ModifierLike>(
  modifiers: readonly M[] | undefined,
  context: ts.TransformationContext,
): readonly (M | ts.ReadonlyKeyword)[] => [
  ...(modifiers ?? []).filter(
    (m) => !ts.isReadonlyKeywordOrPlusOrMinusToken(m),
  ),
  context.factory.createModifier(ts.SyntaxKind.ReadonlyKeyword),
];
