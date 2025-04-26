import * as ts from 'typescript';
import {
  createTransformerFactory,
  dedent,
  defaultFormatter,
  printNode,
} from '../utils/index.mjs';
import { transformSourceCode } from './transform-source-code.mjs';

const noopTransformer: ts.TransformerFactory<ts.SourceFile> =
  createTransformerFactory((context) => {
    const visitor: ts.Visitor = (node: ts.Node): ts.VisitResult<ts.Node> => {
      console.debug(`[${ts.SyntaxKind[node.kind]}] ${printNode(node)}\n`);

      return ts.visitEachChild(node, visitor, context);
    };

    return visitor;
  });

describe('astTransformerToStringTransformer', () => {
  describe('Valid', () => {
    test.each([
      ...(
        [
          {
            description: 'No change',
            source: 'const a: number = 1;',
          },
          {
            description: 'Line comment between 2 statements',
            source: dedent`
              const a: number = 1;
              // between statements
              const b: number = 1;
            `,
          },
          {
            description:
              'Comments in function arguments without trailing comma',
            source: dedent`
              /** f */
              const f = (
                /* description1 */
                arg1: number, // line-comment-1
                /* description2 */
                arg2: number // line-comment-2
                /* params-end */
              ): /* ret */ number[] /* => */ => [];
              // f end





              // file end
            `,
          },
          {
            description:
              'A line comment to the last arguments of function with trailing comma',
            source: dedent`
              const f = (
                arg: number, // line-comment
              ): number[] => [];
            `,
          },
          {
            description: 'A comment to the end of parameters of function',
            source: 'const f = (arg: number /* params-end */): number[] => [];',
          },
          {
            description:
              'A comment to the end of parameters of function with trailing comma',
            source:
              'const f = (arg: number, /* params-end */): number[] => [];',
          },
          {
            description: 'Comments in function arguments with trailing comma',
            source: dedent`
              /** f */
              const f = (
                /* description1 */
                arg1: number, // line-comment-1
                /* description2 */
                arg2: number, // line-comment-2
                /* params-end */
              ): /* ret */ number[] /* => */ => [];
              // f end





              // file end
            `,
          },
          {
            description: 'shebang',
            source: dedent`
              #!/usr/bin/env node
              'use strict'



              /** f */
              const f = () => {}
            `,
          },
          {
            description: 'Isolated comments',
            source: dedent`
              const f = (
                arg1: number,
                arg2: number,
              ): void => [];


              /** f */



              const g = (
                arg1: number,
                arg2: number,
              ): void => [];
            `,
          },
          {
            description: 'namespaced',
            source: dedent`
              namespace TestCode {
                // Combined example
                type ComplexData = {
                  id: number;
                  values: any[]; // any -> unknown, array -> readonly
                  settings: {
                    enabled: boolean;
                    thresholds: number[]; // array -> readonly
                  };
                };

                export const initialData: ComplexData[] = [
                  // array -> readonly
                  {
                    id: 1,
                    values: [10, 'any', true as const], // any -> unknown, primitive as const removed
                    settings: { enabled: true, thresholds: [0.5, 0.8] },
                  },
                ]; // append as const to outer array
              }
            `,
          },
          {
            description: 'JSDoc',
            source: dedent`
              type TransformSourceCodeOptions = DeepReadonly<{
                /**
                 * @default \`".ts"\`
                 *
                 * @example ".ts", ".tsx", ".mts", ".cts", ".d.ts", ".d.mts", ".d.cts"
                 */
                ext?: string;

                tsconfig?: {
                  /** @default \`"tsconfig.json"\` */
                  name?: string;

                  /** @default \`process.cwd()\` */
                  searchPath?: string;
                };

                /** @default \`false\` */
                debug?: boolean;
              }>;
            `,
          },
        ] as const satisfies {
          description: string;
          source: string;
          debug?: boolean;
        }[] as DeepReadonly<
          {
            description: string;
            source: string;
            debug?: boolean;
          }[]
        >
      ).map(({ source, description, debug }) => ({
        description,
        source,
        expected: source,
        debug,
      })),
      {
        description: 'A long comment in the last argument of function',
        source: dedent`
          for (const comment of detachedComments) {
            if (transformedNode === undefined) {
              console.warn(
                \`Could not find transformed node corresponding to original node at pos \${nodeToAttach.node.pos}. Comment at \${comment.tokenStart} might be lost.\`,
                // TODO: Fallback strategy (e.g., find the preceding node and attach to its end)
              );
              continue;
            }
          }
        `,
        expected: dedent`
          for (const comment of detachedComments) {
            if (transformedNode === undefined) {
              console.warn(
                \`Could not find transformed node corresponding to original node at pos \${nodeToAttach.node.pos}. Comment at \${comment.tokenStart} might be lost.\` // TODO: Fallback strategy (e.g., find the preceding node and attach to its end)
              );
              continue;
            }
          }
        `, // Note: The newline before the line comment is lost
      },
    ] as const satisfies {
      source: string;
      expected: string;
      description: string;
      debug?: boolean;
    }[] as readonly {
      source: string;
      expected: string;
      description: string;
      debug?: boolean;
    }[])('$description', async ({ expected, source, debug }) => {
      if (debug !== true) {
        // eslint-disable-next-line vitest/no-restricted-vi-methods
        vi.spyOn(console, 'debug').mockImplementation(() => {});
      }

      const transformed = await transformSourceCode(source, [noopTransformer], {
        debug,
      });

      const transformedFormatted = await defaultFormatter(transformed);
      const expectedFormatted = await defaultFormatter(expected);

      expect(transformedFormatted).toBe(expectedFormatted);
    });
  });

  describe('Invalid', () => {
    test('Syntax errors', async () => {
      // eslint-disable-next-line vitest/no-restricted-vi-methods
      vi.spyOn(console, 'debug').mockImplementation(() => {});
      // eslint-disable-next-line vitest/no-restricted-vi-methods
      vi.spyOn(console, 'error').mockImplementation(() => {});

      await expect(
        transformSourceCode('type A = { a: number;', [noopTransformer]),
      ).rejects.toThrow(
        new Error(
          [
            "'}' expected. (1:22)",
            '> 1 | type A = { a: number;',
            '    |                      ^',
          ].join('\n'),
        ),
      );
    });
  });
});
