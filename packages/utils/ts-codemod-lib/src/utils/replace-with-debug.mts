import type * as tsm from 'ts-morph';

export const replaceNodeWithDebugPrint = (
  node: tsm.Node,
  newNodeText: string,
): void => {
  console.debug(`${node.getText()} -> ${newNodeText}`);

  node.replaceWithText(newNodeText);
};
