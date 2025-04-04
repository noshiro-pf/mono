import { SyntaxKind } from 'ts-morph';
import { type SourceFile } from './types.mjs';

export const replaceAnyWithUnknown = (sourceFile: SourceFile): void => {
  for (const node of sourceFile.getDescendantsOfKind(SyntaxKind.AnyKeyword)) {
    node.replaceWithText('unknown');
  }
};
