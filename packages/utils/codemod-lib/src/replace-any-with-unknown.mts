import { type SourceFile } from './types.mjs';

export const replaceAnyWithUnknown = (_sourceFile: SourceFile): void => {
  // for (const node of sourceFile.getDescendantsOfKind(SyntaxKind.AnyKeyword)) {
  //   node.replaceWithText('unknown');
  // }
};
