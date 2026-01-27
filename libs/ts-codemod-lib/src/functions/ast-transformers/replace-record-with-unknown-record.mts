/* eslint-disable unicorn/consistent-function-scoping -- helper functions are kept inside for clarity */
/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types -- ts-morph uses mutable types */
import { Arr } from 'ts-data-forge';
import * as tsm from 'ts-morph';
import { type TsMorphTransformer } from './types.mjs';

/**
 * Replaces `Readonly<Record<string, unknown>>`, `Record<string, unknown>`,
 * and index signatures `[k: string]: unknown` with `UnknownRecord`
 */
export const replaceRecordWithUnknownRecordTransformer =
  (): TsMorphTransformer => {
    const transformer: TsMorphTransformer = (sourceAst) => {
      const processDeclarations = (
        container: tsm.SourceFile | tsm.ModuleDeclaration,
      ): void => {
        const typeAliases = container.getTypeAliases();

        for (const typeAlias of typeAliases) {
          const typeNode = typeAlias.getTypeNode();

          if (typeNode === undefined) continue;

          visitTypeNode(typeNode);
        }

        const interfaces = container.getInterfaces();

        for (const interfaceDecl of interfaces) {
          // Check if interface has index signature [k: string]: unknown
          const indexSignatures = interfaceDecl.getIndexSignatures();

          const hasStringUnknownSignature = indexSignatures.some((sig) => {
            const keyType = sig.getKeyType();

            const returnType = sig.getReturnType();

            return (
              keyType.getText() === 'string' &&
              returnType.getText() === 'unknown'
            );
          });

          // If it has the signature and no other members, replace entire interface with type alias
          if (hasStringUnknownSignature) {
            const properties = interfaceDecl.getProperties();

            if (properties.length === 0 && indexSignatures.length === 1) {
              // Replace interface with type alias
              const interfaceName = interfaceDecl.getName();

              interfaceDecl.replaceWithText(
                `export type ${interfaceName} = UnknownRecord;`,
              );

              continue;
            }
          }

          // Otherwise, check properties for Record types
          for (const property of interfaceDecl.getProperties()) {
            const typeNode = property.getTypeNode();

            if (typeNode === undefined) continue;

            visitTypeNode(typeNode);
          }
        }
      };

      const visitTypeNode = (node: tsm.TypeNode): void => {
        if (tsm.Node.isTypeReference(node)) {
          // Check if it's Readonly<{ [k: string]: unknown }>
          if (node.getTypeName().getText() === 'Readonly') {
            const typeArgs = node.getTypeArguments();

            if (typeArgs.length === 1) {
              const typeArg = typeArgs[0];

              if (tsm.Node.isTypeLiteral(typeArg)) {
                const members = typeArg.getMembers();

                const indexSigs = members.filter((m) =>
                  tsm.Node.isIndexSignatureDeclaration(m),
                );

                // Check if it has only one index signature [k: string]: unknown
                if (
                  members.length === 1 &&
                  Arr.isArrayOfLength(indexSigs, 1) &&
                  isStringUnknownIndexSignature(indexSigs[0])
                ) {
                  node.replaceWithText('UnknownRecord');

                  return;
                }

                // Otherwise, recurse into the type literal to visit its properties
                visitTypeNode(typeArg);

                return;
              }
            }
          }

          replaceIfRecordUnknown(node);
        }

        // Check for type literal { [k: string]: unknown }
        if (tsm.Node.isTypeLiteral(node)) {
          const members = node.getMembers();

          const indexSigs = members.filter((m) =>
            tsm.Node.isIndexSignatureDeclaration(m),
          );

          // Check if it has only one index signature [k: string]: unknown
          if (
            members.length === 1 &&
            Arr.isArrayOfLength(indexSigs, 1) &&
            isStringUnknownIndexSignature(indexSigs[0])
          ) {
            node.replaceWithText('UnknownRecord');

            return;
          }
        }

        // Recursively visit child type nodes
        if (tsm.Node.isUnionTypeNode(node)) {
          for (const typeNode of node.getTypeNodes()) {
            visitTypeNode(typeNode);
          }
        } else if (tsm.Node.isIntersectionTypeNode(node)) {
          for (const typeNode of node.getTypeNodes()) {
            visitTypeNode(typeNode);
          }
        } else if (tsm.Node.isArrayTypeNode(node)) {
          visitTypeNode(node.getElementTypeNode());
        } else if (tsm.Node.isTupleTypeNode(node)) {
          for (const element of node.getElements()) {
            visitTypeNode(element);
          }
        } else if (tsm.Node.isParenthesizedTypeNode(node)) {
          visitTypeNode(node.getTypeNode());
        } else if (tsm.Node.isTypeLiteral(node)) {
          for (const member of node.getMembers()) {
            if (tsm.Node.isPropertySignature(member)) {
              const typeNode = member.getTypeNode();

              if (typeNode !== undefined) {
                visitTypeNode(typeNode);
              }
            } else if (tsm.Node.isIndexSignatureDeclaration(member)) {
              const typeNode = member.getReturnTypeNode();

              if (typeNode !== undefined) {
                visitTypeNode(typeNode);
              }
            }
          }
        }
      };

      const isStringUnknownIndexSignature = (
        sig: tsm.IndexSignatureDeclaration,
      ): boolean => {
        const keyType = sig.getKeyTypeNode();

        const returnType = sig.getReturnTypeNode();

        return (
          keyType.getText() === 'string' && returnType?.getText() === 'unknown'
        );
      };

      const replaceIfRecordUnknown = (node: tsm.TypeReferenceNode): void => {
        const typeName = node.getTypeName().getText();

        switch (typeName) {
          case 'Record': {
            // Check if it's Record<string, unknown>
            const typeArgs = node.getTypeArguments();

            if (
              typeArgs.length === 2 &&
              typeArgs[0]?.getText() === 'string' &&
              typeArgs[1]?.getText() === 'unknown'
            ) {
              node.replaceWithText('UnknownRecord');
            }

            break;
          }
          case 'Readonly': {
            // Check if it's Readonly<Record<string, unknown>>
            const typeArgs = node.getTypeArguments();

            if (typeArgs.length === 1) {
              const innerType = typeArgs[0];

              if (
                innerType !== undefined &&
                tsm.Node.isTypeReference(innerType)
              ) {
                const innerTypeName = innerType.getTypeName().getText();

                if (innerTypeName === 'Record') {
                  const innerTypeArgs = innerType.getTypeArguments();

                  if (
                    innerTypeArgs.length === 2 &&
                    innerTypeArgs[0]?.getText() === 'string' &&
                    innerTypeArgs[1]?.getText() === 'unknown'
                  ) {
                    node.replaceWithText('UnknownRecord');
                  }
                }
              }
            }

            break;
          }

          default: {
            break;
          }
        }
      };

      // Process top-level declarations
      processDeclarations(sourceAst);

      // Process declarations inside namespaces/modules
      const namespaces = sourceAst.getModules();

      for (const namespace of namespaces) {
        processDeclarations(namespace);
      }
    };

    // eslint-disable-next-line functional/immutable-data
    transformer.transformerName = 'replace-record-with-unknown-record';

    return transformer;
  };
