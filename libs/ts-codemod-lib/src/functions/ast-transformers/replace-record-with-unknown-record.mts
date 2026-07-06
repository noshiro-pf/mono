/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types -- ts-morph uses mutable types */
import { Arr } from 'ts-data-forge';
import * as tsm from 'ts-morph';
import { hasDisableNextLineComment } from '../functions/index.mjs';
import { type TsMorphTransformer } from './types.mjs';

const TRANSFORMER_NAME = 'replace-record-with-unknown-record';

const UNKNOWN_RECORD_MODULE = 'ts-type-forge';

const UNKNOWN_RECORD_NAME = 'UnknownRecord';

/**
 * Replaces `Readonly<Record<string, unknown>>`, `Record<string, unknown>`,
 * and index signatures `[k: string]: unknown` with `UnknownRecord`.
 *
 * When a replacement occurs, also inserts
 * `import { type UnknownRecord } from 'ts-type-forge';` at the top of the
 * source file (or merges into an existing import from `'ts-type-forge'`).
 */
export const replaceRecordWithUnknownRecordTransformer =
  (): TsMorphTransformer =>
    ({
      name: TRANSFORMER_NAME,
      transform: (sourceAst) => {
        const containerModifications = Arr.toUnshifted(
          sourceAst
            .getModules()
            .map((namespace) => processDeclarations(namespace)),
          processDeclarations(sourceAst),
        );

        if (containerModifications.includes(true)) {
          ensureUnknownRecordImport(sourceAst);
        }
      },
    }) as const;

const processDeclarations = (
  container: tsm.SourceFile | tsm.ModuleDeclaration,
): boolean => {
  const typeAliasModifications = container.getTypeAliases().map((typeAlias) => {
    if (hasDisableNextLineComment(typeAlias, TRANSFORMER_NAME)) {
      return false;
    }

    const typeNode = typeAlias.getTypeNode();

    if (typeNode === undefined) return false;

    return visitTypeNode(typeNode);
  });

  const interfaceModifications = container
    .getInterfaces()
    .map((interfaceDecl) => processInterfaceDeclaration(interfaceDecl));

  return [...typeAliasModifications, ...interfaceModifications].includes(true);
};

const processInterfaceDeclaration = (
  interfaceDecl: tsm.InterfaceDeclaration,
): boolean => {
  if (hasDisableNextLineComment(interfaceDecl, TRANSFORMER_NAME)) {
    return false;
  }

  // Check if interface has index signature [k: string]: unknown
  const indexSignatures = interfaceDecl.getIndexSignatures();

  const hasStringUnknownSignature = indexSignatures.some((sig) => {
    const keyType = sig.getKeyType();

    const returnType = sig.getReturnType();

    return keyType.getText() === 'string' && returnType.getText() === 'unknown';
  });

  // If it has the signature and no other members, replace entire interface with type alias.
  // Skip when the interface carries semantics that a plain type alias would lose
  // (type parameters, extends clauses, declare modifier, default export).
  if (
    hasStringUnknownSignature &&
    Arr.isArrayOfLength(interfaceDecl.getProperties(), 0) &&
    Arr.isArrayOfLength(indexSignatures, 1) &&
    Arr.isArrayOfLength(interfaceDecl.getTypeParameters(), 0) &&
    Arr.isArrayOfLength(interfaceDecl.getExtends(), 0) &&
    !interfaceDecl.hasDeclareKeyword() &&
    !interfaceDecl.hasDefaultKeyword()
  ) {
    const exportPrefix = interfaceDecl.hasExportKeyword() ? 'export ' : '';

    const interfaceName = interfaceDecl.getName();

    interfaceDecl.replaceWithText(
      `${exportPrefix}type ${interfaceName} = UnknownRecord;`,
    );

    return true;
  }

  // Otherwise, check properties for Record types
  return interfaceDecl
    .getProperties()
    .map((property) => {
      const typeNode = property.getTypeNode();

      if (typeNode === undefined) return false;

      return visitTypeNode(typeNode);
    })
    .includes(true);
};

const visitTypeNode = (node: tsm.TypeNode): boolean => {
  if (tsm.Node.isTypeReference(node)) {
    // Check if it's Readonly<{ [k: string]: unknown }>
    if (node.getTypeName().getText() === 'Readonly') {
      const typeArgs = node.getTypeArguments();

      if (Arr.isArrayOfLength(typeArgs, 1)) {
        const typeArg = typeArgs[0];

        if (tsm.Node.isTypeLiteral(typeArg)) {
          const members = typeArg.getMembers();

          const indexSigs = members.filter((m) =>
            tsm.Node.isIndexSignatureDeclaration(m),
          );

          // Check if it has only one index signature [k: string]: unknown
          if (
            Arr.isArrayOfLength(members, 1) &&
            Arr.isArrayOfLength(indexSigs, 1) &&
            isStringUnknownIndexSignature(indexSigs[0])
          ) {
            node.replaceWithText('UnknownRecord');

            return true;
          }

          // Otherwise, recurse into the type literal to visit its properties
          return visitTypeNode(typeArg);
        }
      }
    }

    return replaceIfRecordUnknown(node);
  }

  // Check for type literal { [k: string]: unknown }
  if (tsm.Node.isTypeLiteral(node)) {
    const members = node.getMembers();

    const indexSigs = members.filter((m) =>
      tsm.Node.isIndexSignatureDeclaration(m),
    );

    // Check if it has only one index signature [k: string]: unknown
    if (
      Arr.isArrayOfLength(members, 1) &&
      Arr.isArrayOfLength(indexSigs, 1) &&
      isStringUnknownIndexSignature(indexSigs[0])
    ) {
      node.replaceWithText('UnknownRecord');

      return true;
    }

    return members
      .map((member) => {
        if (tsm.Node.isPropertySignature(member)) {
          const typeNode = member.getTypeNode();

          return typeNode === undefined ? false : visitTypeNode(typeNode);
        }

        if (tsm.Node.isIndexSignatureDeclaration(member)) {
          const typeNode = member.getReturnTypeNode();

          return typeNode === undefined ? false : visitTypeNode(typeNode);
        }

        return false;
      })
      .includes(true);
  }

  // Recursively visit child type nodes
  if (tsm.Node.isUnionTypeNode(node) || tsm.Node.isIntersectionTypeNode(node)) {
    return node
      .getTypeNodes()
      .map((typeNode) => visitTypeNode(typeNode))
      .includes(true);
  }

  if (tsm.Node.isArrayTypeNode(node)) {
    return visitTypeNode(node.getElementTypeNode());
  }

  if (tsm.Node.isTupleTypeNode(node)) {
    return node
      .getElements()
      .map((element) => visitTypeNode(element))
      .includes(true);
  }

  if (tsm.Node.isParenthesizedTypeNode(node)) {
    return visitTypeNode(node.getTypeNode());
  }

  // Handles `readonly T[]`, `readonly [...]`, `keyof T`
  if (tsm.Node.isTypeOperatorTypeNode(node)) {
    return visitTypeNode(node.getTypeNode());
  }

  if (tsm.Node.isRestTypeNode(node)) {
    return visitTypeNode(node.getTypeNode());
  }

  if (tsm.Node.isNamedTupleMember(node)) {
    return visitTypeNode(node.getTypeNode());
  }

  return false;
};

const isStringUnknownIndexSignature = (
  sig: tsm.IndexSignatureDeclaration,
): boolean => {
  const keyType = sig.getKeyTypeNode();

  const returnType = sig.getReturnTypeNode();

  return keyType.getText() === 'string' && returnType?.getText() === 'unknown';
};

const replaceIfRecordUnknown = (node: tsm.TypeReferenceNode): boolean => {
  const typeName = node.getTypeName().getText();

  switch (typeName) {
    case 'Record': {
      // Check if it's Record<string, unknown>
      const typeArgs = node.getTypeArguments();

      if (
        Arr.isArrayOfLength(typeArgs, 2) &&
        typeArgs[0].getText() === 'string' &&
        typeArgs[1].getText() === 'unknown'
      ) {
        node.replaceWithText('UnknownRecord');

        return true;
      }

      // Recurse into type arguments (e.g. Record<string, Record<string, unknown>>)
      return typeArgs.map((typeArg) => visitTypeNode(typeArg)).includes(true);
    }
    case 'Readonly': {
      // Check if it's Readonly<Record<string, unknown>>
      const typeArgs = node.getTypeArguments();

      if (Arr.isArrayOfLength(typeArgs, 1)) {
        const innerType = typeArgs[0];

        if (tsm.Node.isTypeReference(innerType)) {
          const innerTypeName = innerType.getTypeName().getText();

          if (innerTypeName === 'Record') {
            const innerTypeArgs = innerType.getTypeArguments();

            if (
              Arr.isArrayOfLength(innerTypeArgs, 2) &&
              innerTypeArgs[0].getText() === 'string' &&
              innerTypeArgs[1].getText() === 'unknown'
            ) {
              node.replaceWithText('UnknownRecord');

              return true;
            }
          }
        }

        // Otherwise, recurse into the type argument
        return visitTypeNode(innerType);
      }

      return false;
    }

    default: {
      // Recurse into type arguments for any other generic type
      return node
        .getTypeArguments()
        .map((typeArg) => visitTypeNode(typeArg))
        .includes(true);
    }
  }
};

const ensureUnknownRecordImport = (sourceFile: tsm.SourceFile): void => {
  const existingImport = sourceFile
    .getImportDeclarations()
    .find((decl) => decl.getModuleSpecifierValue() === UNKNOWN_RECORD_MODULE);

  if (existingImport === undefined) {
    sourceFile.insertImportDeclaration(0, {
      moduleSpecifier: UNKNOWN_RECORD_MODULE,
      namedImports: [{ name: UNKNOWN_RECORD_NAME, isTypeOnly: true }],
    });

    return;
  }

  const alreadyImported = existingImport
    .getNamedImports()
    .some((ni) => ni.getName() === UNKNOWN_RECORD_NAME);

  if (alreadyImported) return;

  existingImport.addNamedImport({
    name: UNKNOWN_RECORD_NAME,
    isTypeOnly: true,
  });
};
