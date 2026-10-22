import type * as tsm from 'ts-morph';

/**
 * `node.replaceWithText(newNodeText)`, sparing a one-line text the indentation
 * lookup.
 *
 * `replaceWithText` writes the text through a writer whose indentation it
 * looks up first, for the lines after the first one, and the lookup reparses
 * the whole file in the language service: on top of the reparse every
 * replacement makes anyway, once per replacement, so it is quadratic in the
 * size of the file. A text with no `\n` has no line after the first, the
 * indentation is never applied, and a plain writer from the same project
 * writes the same text — so the lookup is skipped. A multi-line text takes
 * the original path.
 *
 * The writer is passed as `replaceWithText`'s second argument, which its
 * declaration leaves out and ts-morph passes itself when it sets an
 * expression. Were it ever dropped, the method would look the indentation up
 * as before: slower, never different.
 */
export const replaceNodeWithText = (
  node: tsm.Node,
  newNodeText: string,
): tsm.Node =>
  newNodeText.includes('\n')
    ? node.replaceWithText(newNodeText)
    : (node.replaceWithText as ReplaceWithTextWithWriter).call(
        node,
        newNodeText,
        node.getProject().createWriter(),
      );

type ReplaceWithTextWithWriter = (
  this: tsm.Node,
  textOrWriterFunction: string,
  writer: tsm.CodeBlockWriter,
) => tsm.Node;
