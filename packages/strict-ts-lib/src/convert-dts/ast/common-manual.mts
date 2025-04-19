import { type Edit, Lang, parse } from '@ast-grep/napi';
import { Result } from '@noshiro/mono-utils';

export const convertAstCommonManual = (src: string): Result<string, string> => {
  const ast = parse(Lang.TypeScript, src);
  const root = ast.root();

  const mut_edit: Edit[] = [];

  {
    const pattern = 'declare var $X: $T;';
    const node = root.find(pattern);
    if (node !== null) {
      mut_edit.push(
        node.replace(
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          `declare const ${node.getMatch('X')!.text()}: ${node.getMatch('T')!.text()};`,
        ),
      );
    }
  }
  // {
  //   const pattern = 'var $X: $T;';
  //   const node = root.find(pattern);
  //   if (node !== null) {
  //     mut_edit.push(
  //       node.replace(
  //         // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  //         `const ${node.getMatch('X')!.text()}: ${node.getMatch('T')!.text()};`,
  //       ),
  //     );
  //   }
  // }

  return Result.ok(root.commitEdits(mut_edit));
};
