import {
  ESLintUtils,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { asNode, createGetLayerTypes } from 'eslint-rule-forge';
import type { DeepReadonly } from 'ts-type-forge';
import * as ts from 'typescript';

type Options = readonly [];

type MessageIds = 'optionalPhantom';

/**
 * Disallow an optional property or method keyed by a type-only symbol: a
 * `declare const tag: unique symbol` at the top level of a module that is not a
 * declaration file.
 *
 * ## Why
 *
 * Such a symbol has no value at run time, so the property exists only in the
 * type: a phantom marker. A marker like this usually stands for a claim, such
 * as "this operator keeps the initial value" or "this value is validated".
 * Optional, it is satisfied by every value that lacks it, so a function or an
 * object that has not earned the claim is accepted with no `as`, and the type
 * vouches for something the implementation never produced.
 *
 * Make the marker required, so that only an explicit `as` or a type guard can
 * attach it, or move the claim into a type the implementation has to produce,
 * such as the return type. See "Claims a value must earn" in
 * `docs/typescript-coding-rules.md`.
 *
 * That is how a type-only symbol is written, and the only form reported. A
 * symbol declared any other way is not reported: in a declaration file
 * (`Symbol.iterator`, a library's `.d.mts`), in a script, in `declare global`,
 * `declare module` or a namespace, or as a class member. A run-time global or a
 * value a bundler's `define` injects is declared in `declare global`, not with
 * a module-level `declare const`, which this rule takes for a phantom.
 *
 * An optional key whose type is `never`, `undefined` or `void`, or a union of
 * them (`[tag]?: never`), says that a value must not carry the marker, which
 * claims nothing, and is not reported.
 *
 * The rule reads the `?` written on a member. A phantom key made optional by a
 * mapped type (`{ [P in typeof tag]?: K }`, `Partial<{ [tag]: K }>`) is not
 * seen.
 *
 * The key is judged by its type, which is what names the property. A method
 * with a body may wrap its key (`[tag as symbol]?() {}`), so the key is
 * reported when its type at any wrapper layer is a type-only symbol.
 */
export const noOptionalPhantomProperty: TSESLint.RuleModule<
  MessageIds,
  Options
> = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow an optional property keyed by a type-only symbol (`declare const tag: unique symbol`), which every value that lacks it satisfies',
    },
    schema: [],
    messages: {
      optionalPhantom:
        'This optional property is keyed by a symbol that exists only in types, so every value that lacks it satisfies it and the claim it stands for is never checked. Make it required, so that only `as` or a type guard attaches it, or put the claim in a type the implementation must produce, such as its return type.',
    },
    defaultOptions: [],
  },

  create: (context) => {
    const parserServices = ESLintUtils.getParserServices(context);

    const typeOf = (node: DeepReadonly<TSESTree.Node>): ts.Type =>
      parserServices.getTypeAtLocation(asNode(node));

    const getLayerTypes = createGetLayerTypes(parserServices);

    /**
     * Reports `node` when it is optional, keyed by a type-only symbol, and its
     * `annotation` (a method has none) does not say the marker must be absent.
     */
    const check = (
      node: DeepReadonly<
        | TSESTree.AccessorProperty
        | TSESTree.MethodDefinition
        | TSESTree.PropertyDefinition
        | TSESTree.TSAbstractAccessorProperty
        | TSESTree.TSAbstractMethodDefinition
        | TSESTree.TSAbstractPropertyDefinition
        | TSESTree.TSMethodSignature
        | TSESTree.TSPropertySignature
      >,
      annotation: DeepReadonly<TSESTree.TSTypeAnnotation> | undefined,
    ): void => {
      if (!node.optional || !node.computed) {
        return;
      }

      if (!getLayerTypes(node.key).some(isTypeOnlySymbol)) {
        return;
      }

      if (
        annotation !== undefined &&
        claimsAbsence(typeOf(annotation.typeAnnotation))
      ) {
        return;
      }

      context.report({
        node: asNode(node.key),
        messageId: 'optionalPhantom',
      });
    };

    return {
      AccessorProperty: (node) => {
        check(node, node.typeAnnotation);
      },
      MethodDefinition: (node) => {
        check(node, undefined);
      },
      PropertyDefinition: (node) => {
        check(node, node.typeAnnotation);
      },
      TSAbstractAccessorProperty: (node) => {
        check(node, node.typeAnnotation);
      },
      TSAbstractMethodDefinition: (node) => {
        check(node, undefined);
      },
      TSAbstractPropertyDefinition: (node) => {
        check(node, node.typeAnnotation);
      },
      TSMethodSignature: (node) => {
        check(node, undefined);
      },
      TSPropertySignature: (node) => {
        check(node, node.typeAnnotation);
      },
    };
  },
} as const;

/**
 * Whether `declaration` is a `declare const` at the top level of a module that
 * is not a declaration file, so that it has no value at run time.
 */
// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types -- a compiler node, read only
const isTypeOnlyDeclaration = (declaration: ts.Declaration): boolean => {
  if (!ts.isVariableDeclaration(declaration)) {
    return false;
  }

  // A `for` loop's declaration list has no statement of its own.
  const statement = declaration.parent.parent;

  return (
    ts.isVariableStatement(statement) &&
    ts.isSourceFile(statement.parent) &&
    !statement.parent.isDeclarationFile &&
    ts.isExternalModule(statement.parent) &&
    (ts.getModifiers(statement) ?? []).some(
      (modifier) => modifier.kind === ts.SyntaxKind.DeclareKeyword,
    )
  );
};

/** Whether `type` is a `unique symbol` that has no value at run time. */
// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types -- a compiler type, read only
const isTypeOnlySymbol = (type: ts.Type): boolean =>
  (type.flags & ts.TypeFlags.UniqueESSymbol) !== 0 &&
  type.symbol.valueDeclaration !== undefined &&
  isTypeOnlyDeclaration(type.symbol.valueDeclaration);

/**
 * Whether a property's type says that a value must not have it: `never`,
 * `undefined`, `void`, or a union of them.
 */
// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types -- a compiler type, read only
const claimsAbsence = (type: ts.Type): boolean =>
  type.isUnion()
    ? type.types.every(claimsAbsence)
    : (type.flags &
        (ts.TypeFlags.Never | ts.TypeFlags.Undefined | ts.TypeFlags.Void)) !==
      0;
