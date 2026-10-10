import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import * as path from 'node:path';
import { Arr } from 'ts-data-forge';
import { type FixedLengthTuple } from 'ts-type-forge';
import { isExportedValueUsed } from './export-usage.mjs';
import { getTsFortressImports } from './import-utils.mjs';
import { packageEntryPoints } from './package-entry-points.mjs';

type Options = readonly [
  Readonly<{
    entryPoints?: readonly string[];
  }>?,
];

type MessageIds = 'typeOnlyCodec';

/** The ts-fortress type that derives a type from a codec. */
const TYPE_OF = 'TypeOf';

/**
 * A codec exists to check values at runtime. One declared next to
 * `type Y = t.TypeOf<typeof X>` and never read as a value is a type written the
 * long way round: it costs a runtime object and a bundle import, and it reads
 * as if something validated with it. This rule reports such a codec, so that
 * `Y` becomes a plain type alias.
 *
 * "Never read as a value" means: no value reference in its own file outside
 * `typeof`, every import of it elsewhere `import type`, and no entry point
 * re-exporting it. The entry points are what the nearest `package.json`
 * publishes, traced back to source, unless the `entryPoints` option names them.
 * The cross-file part reads the importers from the TypeScript program; without
 * type information, or when the published entry points cannot all be traced
 * back to source, an exported codec is left alone.
 */
export const noTypeOnlyCodec: TSESLint.RuleModule<MessageIds, Options> = {
  meta: {
    type: 'suggestion',
    docs: {
      description: `Report a ts-fortress codec \`X\` paired with \`type Y = t.${TYPE_OF}<typeof X>\` whose value nothing reads, so that \`Y\` is declared as a plain type instead.`,
    },
    schema: [
      {
        type: 'object',
        properties: {
          entryPoints: {
            type: 'array',
            items: { type: 'string' },
            uniqueItems: true,
            description: [
              'Files whose exports are public API. A codec they export,',
              'directly or through re-exports, is never reported. Replaces',
              'the entry points read from the nearest package.json, for a',
              'layout they cannot be traced back to source from. Relative',
              'paths are resolved against the working directory ESLint runs',
              'in; pass absolute paths to make the config independent of it.',
            ].join(' '),
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      typeOnlyCodec: `\`{{name}}\` is a codec used only as a type: nothing reads its value. Declare \`type {{typeName}}\` directly instead of deriving it with \`${TYPE_OF}<typeof {{name}}>\`, and remove the codec.`,
    },
  },

  create: (context) => {
    const sourceCode = context.sourceCode;

    const entryPointOption = context.options[0]?.entryPoints;

    return {
      Program: (program) => {
        const isTypeOf = buildTypeOfMatcher(getTsFortressImports(program));

        if (isTypeOf === undefined) {
          return;
        }

        const pairs = findCodecPairs(program, isTypeOf);

        if (!Arr.isNonEmpty(pairs)) {
          return;
        }

        const exportedNames = collectExportedValueNames(program);

        // Built for the first exported codec that needs it, so a file whose
        // codecs are all used locally reads neither the program nor a
        // package.json.
        let mut_isUsedElsewhere: ((exportName: string) => boolean) | undefined;

        const isUsedElsewhere = (exportName: string): boolean => {
          mut_isUsedElsewhere ??= buildCrossFileCheck(
            context,
            program,
            entryPointOption,
          );

          return mut_isUsedElsewhere(exportName);
        };

        for (const { declarator, id, typeName } of pairs) {
          const variable = sourceCode
            .getDeclaredVariables(declarator)
            .find((candidate) => candidate.name === id.name);

          if (
            variable === undefined ||
            variable.references.some(isValueUse) ||
            (exportedNames.get(id.name) ?? []).some(isUsedElsewhere)
          ) {
            continue;
          }

          context.report({
            node: id,
            messageId: 'typeOnlyCodec',
            data: { name: id.name, typeName },
          });
        }
      },
    };
  },
  defaultOptions: [{}],
} as const;

/** A codec and the name of the type alias derived from it. */
type CodecPair = Readonly<{
  declarator: TSESTree.VariableDeclarator;
  id: TSESTree.Identifier;
  typeName: string;
}>;

/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */

/**
 * A predicate telling whether a type name spells ts-fortress's `TypeOf` —
 * `t.TypeOf` through a namespace import, or the local name of a named import —
 * or `undefined` when the file imports it under no name at all.
 */
const buildTypeOfMatcher = (
  importDeclarations: readonly TSESTree.ImportDeclaration[],
): ((typeName: TSESTree.EntityName) => boolean) | undefined => {
  const specifiers = importDeclarations.flatMap(
    (declaration) => declaration.specifiers,
  );

  const namespaceNames = new Set(
    specifiers
      .filter(
        (specifier) =>
          specifier.type === AST_NODE_TYPES.ImportNamespaceSpecifier,
      )
      .map((specifier) => specifier.local.name),
  );

  const typeOfNames = new Set(
    specifiers
      .filter(
        (specifier) =>
          specifier.type === AST_NODE_TYPES.ImportSpecifier &&
          (specifier.imported.type === AST_NODE_TYPES.Identifier
            ? specifier.imported.name
            : specifier.imported.value) === TYPE_OF,
      )
      .map((specifier) => specifier.local.name),
  );

  if (namespaceNames.size === 0 && typeOfNames.size === 0) {
    return undefined;
  }

  return (typeName) =>
    typeName.type === AST_NODE_TYPES.Identifier
      ? typeOfNames.has(typeName.name)
      : typeName.type === AST_NODE_TYPES.TSQualifiedName &&
        typeName.left.type === AST_NODE_TYPES.Identifier &&
        namespaceNames.has(typeName.left.name) &&
        typeName.right.name === TYPE_OF;
};

/**
 * The top-level `const X = …` declarators that a top-level
 * `type Y = t.TypeOf<typeof X>` derives a type from — the pair that marks `X`
 * as a ts-fortress codec. `Y` is usually `X` itself, or `X` is `yTypeDef`.
 * Whether either is exported does not matter here.
 */
const findCodecPairs = (
  program: TSESTree.Program,
  isTypeOf: (typeName: TSESTree.EntityName) => boolean,
): readonly CodecPair[] => {
  const statements = program.body.map((statement) =>
    statement.type === AST_NODE_TYPES.ExportNamedDeclaration &&
    statement.declaration !== null
      ? statement.declaration
      : statement,
  );

  // Codec name to the alias derived from it; the first alias wins when a
  // codec has several, which only changes the name the message quotes.
  const mut_typeNames = new Map<string, string>();

  for (const statement of statements) {
    if (
      statement.type !== AST_NODE_TYPES.TSTypeAliasDeclaration ||
      statement.typeParameters !== undefined
    ) {
      continue;
    }

    const codecName = derivedCodecName(statement.typeAnnotation, isTypeOf);

    if (codecName !== undefined && !mut_typeNames.has(codecName)) {
      mut_typeNames.set(codecName, statement.id.name);
    }
  }

  return statements
    .filter(
      (statement): statement is TSESTree.VariableDeclaration =>
        statement.type === AST_NODE_TYPES.VariableDeclaration,
    )
    .flatMap((statement) => statement.declarations)
    .flatMap((declarator) => {
      if (declarator.id.type !== AST_NODE_TYPES.Identifier) {
        return [];
      }

      const typeName = mut_typeNames.get(declarator.id.name);

      return typeName === undefined
        ? []
        : [{ declarator, id: declarator.id, typeName }];
    });
};

/** `X` when `node` is exactly `t.TypeOf<typeof X>`, otherwise `undefined`. */
const derivedCodecName = (
  node: TSESTree.TypeNode,
  isTypeOf: (typeName: TSESTree.EntityName) => boolean,
): string | undefined => {
  if (
    node.type !== AST_NODE_TYPES.TSTypeReference ||
    !isTypeOf(node.typeName)
  ) {
    return undefined;
  }

  const params = node.typeArguments?.params ?? [];

  const [query] = params;

  return Arr.isFixedLengthArray(1, params) &&
    query?.type === AST_NODE_TYPES.TSTypeQuery &&
    query.typeArguments === undefined &&
    query.exprName.type === AST_NODE_TYPES.Identifier
    ? query.exprName.name
    : undefined;
};

/**
 * The names each top-level binding is exported as with its value — through
 * `export const`, `export { X }`, `export { X as Y }` or `export default X`.
 * `export type { X }` exports no value, so it adds nothing.
 */
const collectExportedValueNames = (
  program: TSESTree.Program,
): ReadonlyMap<string, readonly string[]> => {
  const entries = program.body.flatMap(
    (statement): readonly FixedLengthTuple<2, string>[] => {
      if (statement.type === AST_NODE_TYPES.ExportDefaultDeclaration) {
        return statement.declaration.type === AST_NODE_TYPES.Identifier
          ? [[statement.declaration.name, 'default']]
          : [];
      }

      if (
        statement.type !== AST_NODE_TYPES.ExportNamedDeclaration ||
        statement.exportKind === 'type'
      ) {
        return [];
      }

      if (statement.declaration !== null) {
        return statement.declaration.type === AST_NODE_TYPES.VariableDeclaration
          ? statement.declaration.declarations.flatMap((declarator) =>
              declarator.id.type === AST_NODE_TYPES.Identifier
                ? [[declarator.id.name, declarator.id.name] as const]
                : [],
            )
          : [];
      }

      // `export { X } from './a.mjs'` re-exports another module's `X`.
      if (statement.source !== null) {
        return [];
      }

      return statement.specifiers.flatMap((specifier) =>
        specifier.exportKind === 'type'
          ? []
          : [
              [
                specifier.local.name,
                specifier.exported.type === AST_NODE_TYPES.Identifier
                  ? specifier.exported.name
                  : specifier.exported.value,
              ] as const,
            ],
      );
    },
  );

  const mut_names = new Map<string, string[]>();

  for (const [local, exported] of entries) {
    const mut_existing = mut_names.get(local);

    if (mut_existing === undefined) {
      mut_names.set(local, [exported]);
    } else {
      mut_existing.push(exported);
    }
  }

  return mut_names;
};

/**
 * Whether a reference reads the codec's value at runtime. Its own
 * initialization, `typeof X` in a type, and the name in an export list are
 * not reads.
 */
const isValueUse = (reference: TSESLint.Scope.Reference): boolean =>
  reference.init !== true &&
  reference.isValueReference &&
  reference.identifier.parent.type !== AST_NODE_TYPES.ExportSpecifier &&
  reference.identifier.parent.type !==
    AST_NODE_TYPES.ExportDefaultDeclaration &&
  !isInTypeQuery(reference.identifier);

const isInTypeQuery = (node: TSESTree.Node): boolean =>
  node.type !== AST_NODE_TYPES.Program &&
  (node.parent.type === AST_NODE_TYPES.TSTypeQuery ||
    isInTypeQuery(node.parent));

/**
 * Whether another file of the TypeScript program reads the value this file
 * exports under a given name, or an entry point re-exports it. Answers "yes"
 * for every name when it cannot tell: when the file was parsed without type
 * information, or when the entry points come from a package.json that cannot
 * be traced back to source.
 */
const buildCrossFileCheck = (
  context: Readonly<TSESLint.RuleContext<MessageIds, Options>>,
  program: TSESTree.Program,
  entryPointOption: readonly string[] | undefined,
): ((exportName: string) => boolean) => {
  const services = context.sourceCode.parserServices;

  const tsProgram = services?.program ?? undefined;

  const sourceFile =
    tsProgram === undefined
      ? undefined
      : services?.esTreeNodeToTSNodeMap?.get(program);

  if (tsProgram === undefined || sourceFile === undefined) {
    return () => true;
  }

  const fileName = sourceFile.fileName;

  // Normalized through the program, so that they compare equal to the file
  // names it reports whatever the platform's path separator.
  const entryPoints =
    entryPointOption === undefined
      ? packageEntryPoints(tsProgram, fileName)
      : new Set(
          entryPointOption.map((entryPoint) => {
            const absolute = path.resolve(context.cwd, entryPoint);

            return tsProgram.getSourceFile(absolute)?.fileName ?? absolute;
          }),
        );

  if (entryPoints === undefined) {
    return () => true;
  }

  return (exportName) =>
    isExportedValueUsed(tsProgram, fileName, exportName, entryPoints);
};
