/* eslint-disable unicorn/consistent-function-scoping -- helper functions are kept inside for clarity */
/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types -- ts-morph uses mutable types */
import { Arr } from 'ts-data-forge';
import type * as tsm from 'ts-morph';
import { hasDisableNextLineComment } from '../functions/index.mjs';
import { type TsMorphTransformer } from './types.mjs';

const TRANSFORMER_NAME = 'convert-interface-to-type';

/**
 * interface による型定義を type による型定義に変換する。
 * @typescript-eslint/consistent-type-definitions: ["error", "type"] と同等の動作
 */
export const convertInterfaceToTypeTransformer = (): TsMorphTransformer =>
  ({
    name: TRANSFORMER_NAME,
    transform: (sourceAst) => {
      const processInterfaces = (
        container: tsm.SourceFile | tsm.ModuleDeclaration,
      ): void => {
        const interfaces = container.getInterfaces();

        for (const interfaceDecl of interfaces) {
          if (hasDisableNextLineComment(interfaceDecl, TRANSFORMER_NAME)) {
            continue;
          }

          convertInterfaceToType(interfaceDecl);
        }
      };

      const convertInterfaceToType = (
        interfaceDecl: tsm.InterfaceDeclaration,
      ): void => {
        const interfaceName = interfaceDecl.getName();

        const typeParameters = interfaceDecl.getTypeParameters();

        const extendsExpressions = interfaceDecl.getExtends();

        const members = interfaceDecl.getMembers();

        // Build type parameters string
        const typeParamsStr = Arr.isNonEmpty(typeParameters)
          ? `<${typeParameters.map((tp) => tp.getText()).join(', ')}>`
          : '';

        // Build type literal from members
        const mut_typeBody: string = (() => {
          if (Arr.isArrayOfLength(extendsExpressions, 0)) {
            // No extends: simple type literal
            return buildTypeLiteral(members);
          }

          if (Arr.isArrayOfLength(members, 0)) {
            // Only extends, no own members: union of extended types
            const extendedTypes = extendsExpressions.map((ext) =>
              ext.getText(),
            );

            return Arr.isArrayOfLength(extendedTypes, 1)
              ? extendedTypes[0]
              : extendedTypes.join(' & ');
          }

          // Both extends and own members: intersection
          const extendedTypesWithMembers = extendsExpressions.map((ext) =>
            ext.getText(),
          );

          const ownType = buildTypeLiteral(members);

          return [...extendedTypesWithMembers, ownType].join(' & ');
        })();

        // Get export keyword
        const isExported = interfaceDecl.isExported();

        const exportKeyword = isExported ? 'export ' : '';

        // Get leading comments (including JSDoc)
        const leadingComments = interfaceDecl.getLeadingCommentRanges();

        const commentTexts = leadingComments
          .map((range) => range.getText())
          .join('\n');

        const jsDocText = commentTexts.length > 0 ? `${commentTexts}\n` : '';

        // Replace interface with type alias
        const typeAliasText =
          `${jsDocText}${exportKeyword}type ${interfaceName}${typeParamsStr} = ${mut_typeBody};` as const;

        interfaceDecl.replaceWithText(typeAliasText);
      };

      const buildTypeLiteral = (
        members: readonly tsm.TypeElementTypes[],
      ): string => {
        if (Arr.isArrayOfLength(members, 0)) {
          return 'Record<string, never>';
        }

        const memberTexts = members.map((member) => {
          // Preserve comments
          const leadingComments = member
            .getLeadingCommentRanges()
            .map((range) => range.getText())
            .join('\n');

          const memberText = member.getText();

          return leadingComments.length > 0
            ? `${leadingComments}\n${memberText}`
            : memberText;
        });

        return `{\n  ${memberTexts.join('\n  ')}\n}`;
      };

      // Process top-level interface declarations
      processInterfaces(sourceAst);

      // Process interfaces inside namespaces/modules
      const namespaces = sourceAst.getModules();

      for (const namespace of namespaces) {
        processInterfaces(namespace);
      }
    },
  }) as const;
