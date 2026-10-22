import type * as tsm from 'ts-morph';
import { replaceNodeWithText } from './replace-node-with-text.mjs';

export const replaceNodeWithDebugPrint = (
  node: tsm.Node,
  newNodeText: string,
): void => {
  console.debug(`${node.getText()} -> ${newNodeText}`);

  replaceNodeWithText(node, newNodeText);
};
