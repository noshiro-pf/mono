import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { Arr } from 'ts-data-forge';
import { TS_FORTRESS_MODULE } from './constants.mjs';
import { getTsFortressImports, hasForeignBinding } from './import-utils.mjs';

type Options = readonly [
  Readonly<{
    namespaceName?: string;
  }>?,
];

type MessageIds = 'removeSideEffectImport' | 'useNamespaceImport';

/** Local name the autofix gives the namespace import a file does not have yet. */
const DEFAULT_NAMESPACE_NAME = 't';

/** One reference of an imported binding, and the text that replaces it. */
type ReferenceRewrite = Readonly<{
  identifier: TSESTree.Identifier;
  text: string;
}>;

/** What the autofix has to do, once it is known to be safe. */
type FixPlan = Readonly<{
  /**
   * The declaration that becomes the namespace import the file is missing, and
   * the text it becomes. `undefined` when the file already has a namespace
   * import to merge into, or when nothing is imported by name — every reported
   * declaration is then removed outright.
   */
  replaced:
    Readonly<{ node: TSESTree.ImportDeclaration; text: string }> | undefined;
  /** Declarations deleted along with the rest of their line. */
  removed: readonly TSESTree.ImportDeclaration[];
  rewrites: readonly ReferenceRewrite[];
}>;

/**
 * ts-fortress is designed to be reached through a namespace: its exports are
 * short, generic names (`string`, `number`, `record`, `Type`) that collide with
 * globals and with local declarations as soon as they are pulled into a file's
 * scope, and every schema in the wild is written as `t.string()`. This rule
 * makes that the only spelling, rewriting named and default imports — and every
 * reference to them — to member accesses on one namespace import. A bare
 * `import 'ts-fortress';` is deleted rather than rewritten: it binds no name,
 * and the package declares `sideEffects: false`, so it does nothing at all.
 */
export const preferNamespaceImport: TSESLint.RuleModule<MessageIds, Options> = {
  meta: {
    type: 'suggestion',
    docs: {
      description: `Require \`${TS_FORTRESS_MODULE}\` to be imported as a namespace (\`import * as t from '${TS_FORTRESS_MODULE}';\` or \`import type * as t from '${TS_FORTRESS_MODULE}';\`) rather than through named, default or bare side-effect imports.`,
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          namespaceName: {
            type: 'string',
            pattern: String.raw`^[$A-Z_a-z][$\w]*$`,
            description: [
              'Local name the autofix gives the namespace import when the',
              "file has none to merge into. Defaults to 't'. A namespace",
              'import already in the file is reused under its own name,',
              'whatever this is set to.',
            ].join(' '),
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      useNamespaceImport: `Import \`${TS_FORTRESS_MODULE}\` as a namespace (\`import * as {{namespaceName}} from '${TS_FORTRESS_MODULE}';\`) and reach its exports through it, rather than importing them by name.`,
      removeSideEffectImport: `\`import '${TS_FORTRESS_MODULE}';\` binds no name, and \`${TS_FORTRESS_MODULE}\` declares \`sideEffects: false\`, so it does nothing. Remove it and import the namespace where its exports are needed.`,
    },
  },

  create: (context) => {
    const sourceCode = context.sourceCode;

    const namespaceNameOption =
      context.options[0]?.namespaceName ?? DEFAULT_NAMESPACE_NAME;

    return {
      // Collected at the end of the file rather than per declaration: the fix
      // has to see every ts-fortress import at once to know whether there is a
      // namespace to merge into, and which declaration becomes it.
      'Program:exit': () => {
        const declarations = getTsFortressImports(sourceCode.ast);

        const reported = declarations.filter(
          (declaration) => !isNamespaceOnly(declaration),
        );

        if (!Arr.isNonEmpty(reported)) return;

        const namespaceSpecifiers = declarations
          .flatMap((declaration) => declaration.specifiers)
          .filter(isNamespaceSpecifier);

        const [reused] = namespaceSpecifiers;

        const namespaceName = reused?.local.name ?? namespaceNameOption;

        const plan = buildFixPlan(
          sourceCode,
          reported,
          namespaceSpecifiers,
          namespaceName,
        );

        for (const [index, declaration] of reported.entries()) {
          context.report({
            node: declaration,
            messageId: isBare(declaration)
              ? 'removeSideEffectImport'
              : 'useNamespaceImport',
            data: { namespaceName },
            // Every edit rides on a single report: ESLint merges the fixes of
            // one report into one edit span, so splitting them across the
            // reports of a file with two offending imports would make them
            // conflict and drop one.
            fix:
              plan === undefined || index > 0
                ? undefined
                : (fixer) => [
                    ...(plan.replaced === undefined
                      ? []
                      : [
                          fixer.replaceText(
                            plan.replaced.node,
                            plan.replaced.text,
                          ),
                        ]),
                    ...plan.removed.map((removed) =>
                      removeStatement(fixer, sourceCode, removed),
                    ),
                    ...plan.rewrites.map(({ identifier, text }) =>
                      fixer.replaceText(identifier, text),
                    ),
                  ],
          });
        }
      },
    };
  },
  defaultOptions: [{ namespaceName: DEFAULT_NAMESPACE_NAME }],
} as const;

/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */

/**
 * Whether a declaration is already what the rule asks for: one or more
 * namespace specifiers and nothing else. A bare `import 'ts-fortress';` has no
 * specifiers, so it is not one of these — it is reported and deleted.
 */
const isNamespaceOnly = (declaration: TSESTree.ImportDeclaration): boolean =>
  !Arr.isEmpty(declaration.specifiers) &&
  declaration.specifiers.every(isNamespaceSpecifier);

/** Whether a declaration binds no name — `import 'ts-fortress';`. */
const isBare = (declaration: TSESTree.ImportDeclaration): boolean =>
  Arr.isEmpty(declaration.specifiers);

const isNamespaceSpecifier = (
  specifier: TSESTree.ImportClause,
): specifier is TSESTree.ImportNamespaceSpecifier =>
  specifier.type === AST_NODE_TYPES.ImportNamespaceSpecifier;

/**
 * The edits that route every named and default ts-fortress import in the file
 * through one namespace and delete the rest, or `undefined` when some part of
 * it cannot be rewritten safely — the violations are then reported without a
 * fix, because a partial rewrite would leave the file referencing a binding
 * that no longer exists.
 */
const buildFixPlan = (
  sourceCode: TSESLint.SourceCode,
  reported: readonly TSESTree.ImportDeclaration[],
  namespaceSpecifiers: readonly TSESTree.ImportNamespaceSpecifier[],
  namespaceName: string,
): FixPlan | undefined => {
  const [reused] = namespaceSpecifiers;

  // Two namespace imports leave no single target to route the references to,
  // and a declaration that mixes a namespace specifier with a named one would
  // have to be taken apart rather than replaced or removed.
  if (
    namespaceSpecifiers.length > 1 ||
    reported.some((declaration) =>
      declaration.specifiers.some(isNamespaceSpecifier),
    )
  ) {
    return undefined;
  }

  // A bare import binds nothing to route anywhere, so it never decides what the
  // namespace import looks like — it is only deleted.
  const offending = reported.filter((declaration) => !isBare(declaration));

  const typeOnly = offending.every(
    (declaration) => declaration.importKind === 'type',
  );

  // `import type * as t` cannot carry a value reference, so a value import
  // does not merge into one; a namespace import of its own would be a second
  // one, which the check above rules out.
  if (!typeOnly && reused?.parent.importKind === 'type') return undefined;

  const mut_rewrites: ReferenceRewrite[] = [];

  for (const declaration of offending) {
    const variables = sourceCode.getDeclaredVariables(declaration);

    for (const specifier of declaration.specifiers) {
      const member = resolveMember(specifier);

      const variable = variables.find((candidate) =>
        candidate.defs.some((def) => def.node === specifier),
      );

      if (member === undefined || variable === undefined) return undefined;

      for (const reference of variable.references) {
        const rewrite = buildReferenceRewrite(
          sourceCode,
          reference.identifier,
          namespaceName,
          member.name,
        );

        if (rewrite === undefined) return undefined;

        mut_rewrites.push(rewrite);
      }
    }
  }

  const [anchor] = offending;

  // With a namespace import already in the file, or nothing left that binds a
  // name, there is none to create: everything reported just goes away.
  const replaced =
    reused === undefined && anchor !== undefined
      ? ({
          node: anchor,
          text: `import ${typeOnly ? 'type ' : ''}* as ${namespaceName} from '${TS_FORTRESS_MODULE}';`,
        } as const)
      : undefined;

  return {
    replaced,
    removed: reported.filter((declaration) => declaration !== replaced?.node),
    rewrites: mut_rewrites,
  };
};

/**
 * The namespace member the references of a specifier become — `undefined` for
 * a default import, whose references become the namespace itself. The result is
 * `undefined` for an import name that is not an identifier
 * (`import { 'not an identifier' as x }`), which no member access can spell.
 */
const resolveMember = (
  specifier: TSESTree.ImportClause,
): Readonly<{ name: string | undefined }> | undefined =>
  specifier.type === AST_NODE_TYPES.ImportDefaultSpecifier
    ? ({ name: undefined } as const)
    : specifier.type === AST_NODE_TYPES.ImportSpecifier &&
        specifier.imported.type === AST_NODE_TYPES.Identifier
      ? ({ name: specifier.imported.name } as const)
      : undefined;

/**
 * How one reference to an imported binding is rewritten, or `undefined` when it
 * cannot be. Type positions need no special handling: `t.Type` reads as a
 * qualified name there just as it reads as a member access in a value position.
 */
const buildReferenceRewrite = (
  sourceCode: TSESLint.SourceCode,
  identifier: TSESTree.Identifier | TSESTree.JSXIdentifier,
  namespaceName: string,
  memberName: string | undefined,
): ReferenceRewrite | undefined => {
  if (
    identifier.type !== AST_NODE_TYPES.Identifier ||
    // The namespace name has to mean the namespace import at every site the fix
    // writes it; a binding of the same name in scope would capture it instead.
    hasForeignBinding(sourceCode, identifier, namespaceName)
  ) {
    return undefined;
  }

  const target =
    memberName === undefined
      ? namespaceName
      : (`${namespaceName}.${memberName}` as const);

  const parent = identifier.parent;

  // `export { string }` names the binding rather than using it, and a member
  // access is not a name — such a file has to be rewritten by hand.
  if (parent.type === AST_NODE_TYPES.ExportSpecifier) return undefined;

  return {
    identifier,
    // `{ string }` is both the key and the value, so only the value part may
    // become a member access.
    text:
      parent.type === AST_NODE_TYPES.Property &&
      parent.shorthand &&
      parent.value === identifier
        ? `${identifier.name}: ${target}`
        : target,
  };
};

/**
 * Removes an import declaration along with the rest of its line, so that a
 * declaration merged into an existing namespace import does not leave a blank
 * line where it was.
 */
const removeStatement = (
  fixer: TSESLint.RuleFixer,
  sourceCode: TSESLint.SourceCode,
  node: TSESTree.Node,
): TSESLint.RuleFix => {
  const restOfLine = /^[^\S\n]*\n/u.exec(
    sourceCode.getText().slice(node.range[1]),
  );

  return fixer.removeRange([
    node.range[0],
    node.range[1] + (restOfLine?.[0].length ?? 0),
  ]);
};
