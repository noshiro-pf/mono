import {
  AST_NODE_TYPES,
  AST_TOKEN_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { Arr } from 'ts-data-forge';
import type { DeepReadonly } from 'ts-type-forge';
import * as ts from 'typescript';

type Options = readonly [];

type MessageIds = 'detachedJsdoc';

/**
 * Report a `/** … *\/` block that is the JSDoc of no node: one left behind when
 * the declaration it documented moved or was removed, or written where
 * TypeScript does not look for one. TypeScript attaches a JSDoc only to the
 * node it directly precedes, so a detached block shows no documentation in an
 * editor and is no part of the declaration it seems to describe.
 *
 * Which blocks are attached is TypeScript's decision: the rule parses the file
 * with TypeScript and reads, for every node, the JSDoc
 * `ts.getJSDocCommentsAndTags` gives it. Of several blocks before one node only
 * the last is its JSDoc, so the earlier ones are reported. So is a block at the
 * end of a file, a block or a class body, one inside an expression or between a
 * declaration's modifiers, one on a JSX attribute or a call argument, and one
 * on the line of the code before it.
 *
 * Left alone:
 *
 * - the module's documentation: a top-level block with nothing but imports
 *   and directives before it, which a blank line separates from what follows,
 *   or which carries `@module`, `@packageDocumentation`, `@file` or
 *   `@fileoverview`;
 * - a `/*!` block, a `/* … *\/` block with one asterisk, and `/**\/`.
 *
 * No fix is offered: whether the block belongs to another declaration, should
 * be a plain comment or should go is the author's call.
 */
export const noDetachedJsdoc: TSESLint.RuleModule<MessageIds, Options> = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow a JSDoc block that TypeScript attaches to no node, so that it documents nothing',
    },
    schema: [],
    messages: {
      detachedJsdoc:
        'This JSDoc block documents nothing: TypeScript attaches it to no node, so editors do not show it. Move it to the declaration it documents, make it a plain `/* … */` or `//` comment, or delete it.',
    },
  },

  create: (context) => ({
    Program: (program) => {
      const { sourceCode } = context;

      const jsdocComments = sourceCode
        .getAllComments()
        .filter(
          (comment) =>
            comment.type === AST_TOKEN_TYPES.Block &&
            comment.value.startsWith('*'),
        );

      if (Arr.isEmpty(jsdocComments)) {
        return;
      }

      // `filename`, not `physicalFilename`: a processor's virtual file (a `tsx`
      // fence in Markdown) is parsed by its own extension.
      const attached = attachedJsdocStarts(context.filename, sourceCode.text);

      for (const comment of jsdocComments) {
        if (
          !attached.has(comment.range[0]) &&
          !isModuleDocumentation(
            program,
            comment,
            sourceCode.getTokenAfter(comment, { includeComments: true }),
          )
        ) {
          context.report({
            loc: comment.loc,
            messageId: 'detachedJsdoc',
          });
        }
      }
    },
  }),
} as const;

const MODULE_TAG = /@(?:module|packageDocumentation|file|fileoverview)\b/u;

/**
 * Whether `comment` reads as the module's documentation: at the top level, with
 * only imports and directives (`'use strict'`) before it, and set apart from
 * `next`, the token or comment after it, by a blank line, or marked by a module
 * tag. A block directly above another is not, since that is how a block left
 * behind by a removed declaration sits.
 */
const isModuleDocumentation = (
  program: DeepReadonly<TSESTree.Program>,
  comment: DeepReadonly<TSESTree.Comment>,
  next: DeepReadonly<TSESTree.Token> | null,
): boolean => {
  const isTopLevel = program.body.every(
    (statement) =>
      statement.range[1] <= comment.range[0] ||
      comment.range[1] <= statement.range[0],
  );

  const onlyImportsBefore = program.body
    .filter((statement) => statement.range[1] <= comment.range[0])
    .every(
      (statement) =>
        statement.type === AST_NODE_TYPES.ImportDeclaration ||
        statement.type === AST_NODE_TYPES.TSImportEqualsDeclaration ||
        (statement.type === AST_NODE_TYPES.ExpressionStatement &&
          statement.directive !== undefined),
    );

  return (
    isTopLevel &&
    onlyImportsBefore &&
    (MODULE_TAG.test(comment.value) ||
      (next !== null && next.loc.start.line > comment.loc.end.line + 1))
  );
};

/**
 * The start offsets of the `/**` blocks TypeScript attaches to a node of `text`
 * as its JSDoc, other than the end-of-file token. A block before another, whose
 * `@overload` tags alone `ts.getJSDocCommentsAndTags` keeps, counts as attached
 * too.
 */
const attachedJsdocStarts = (
  fileName: string,
  text: string,
): ReadonlySet<number> => {
  const sourceFile = ts.createSourceFile(
    fileName,
    text,
    ts.ScriptTarget.Latest,
    true,
  );

  const mut_starts = new Set<number>();

  const visit = (node: ts.Node): void => {
    // The parser hands the end-of-file token the blocks after the last
    // statement, which document nothing.
    if (node.kind === ts.SyntaxKind.EndOfFileToken) {
      return;
    }

    for (const docOrTag of ts.getJSDocCommentsAndTags(node)) {
      mut_starts.add(ts.isJSDoc(docOrTag) ? docOrTag.pos : docOrTag.parent.pos);
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);

  return mut_starts;
};
