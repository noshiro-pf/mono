import { AST_NODE_TYPES, type TSESTree } from '@typescript-eslint/utils';
import { type DeepReadonly } from 'ts-type-forge';
import { createRule } from './create-rule.mjs';

/**
 * `modules/no-mixed-star-export` — a file that contains `export * from`
 * contains nothing else (Sumi spec/modules.md, D-52).
 *
 * An explicit export (a local declaration, `export { x } from`,
 * `export * as ns from`) silently shadows a same-named star export: neither
 * ECMAScript nor tsc reports it, so adding `foo` to a star-exported module
 * quietly leaves every consumer of the barrel on the other `foo`. Two star
 * exports that collide are reported (TS2308) and fail at runtime, so a barrel
 * made of star exports alone has no silent path. The rule checks the shape
 * only; the collision itself is tsc's job.
 *
 * Both `export * from` and `export type * from` count as star exports.
 * Every other statement in such a file is reported, one diagnostic each.
 */
export const noMixedStarExport = createRule({
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow any statement other than `export * from` in a file that contains one (Sumi D-52).',
    },
    messages: {
      mixed:
        'A file that contains `export * from` may contain nothing else (Sumi D-52): an explicit export here would silently shadow a same-named star export. Move this into its own module and `export * from` it.',
      namespaceReexport:
        '`export * as {{name}} from` is an explicit export of `{{name}}` and may not share a file with `export * from` (Sumi D-52). Move it into its own module and `export * from` it.',
    },
    schema: [],
  },
  defaultOptions: [],
  create: (context) => ({
    Program: (program) => {
      if (!program.body.some(isStarExport)) return;

      for (const statement of program.body) {
        if (isStarExport(statement)) continue;

        if (statement.type === AST_NODE_TYPES.ExportAllDeclaration) {
          // `export * as ns from` — an ExportAllDeclaration with `exported`.
          const exported: unknown = statement.exported;

          context.report({
            node: statement,
            messageId: 'namespaceReexport',
            data: { name: nameOf(exported) },
          });
        } else {
          context.report({ node: statement, messageId: 'mixed' });
        }
      }
    },
  }),
});

/**
 * `export * from` / `export type * from`, and nothing that names an export.
 * oxlint passes `null` where the typings say `undefined`, so `exported` is
 * read as `unknown`.
 */
const isStarExport = (
  statement: DeepReadonly<TSESTree.ProgramStatement>,
): boolean => {
  if (statement.type !== AST_NODE_TYPES.ExportAllDeclaration) return false;

  const exported: unknown = statement.exported;

  return exported === null || exported === undefined;
};

const nameOf = (exported: unknown): string =>
  typeof exported === 'object' &&
  exported !== null &&
  'name' in exported &&
  typeof exported.name === 'string'
    ? exported.name
    : '*';
