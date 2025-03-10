import { Lang, parse } from '@ast-grep/napi';
import { Result, toThisDir } from '@noshiro/mono-utils';
import { composeReplaceOperations } from '../convert-dts/index.mjs';

const thisDir = toThisDir(import.meta.url);

const f = async (): Promise<void> => {
  const source = await fs.readFile(
    path.resolve(thisDir, '../../output/5.7.2/temp/eslint-fixed/lib.es5.d.ts'),
    { encoding: 'utf8' },
  );

  const ast = parse(Lang.TypeScript, source);
  const root = ast.root();

  const result = composeReplaceOperations(root, [
    [
      'declare function parseInt(string: string, radix?: number): number;',
      `declare function parseInt(string: string, radix?: UintRange<2, 37>): number;`,
    ],
  ]);

  if (Result.isErr(result)) return;

  const newSource = result.value;

  await fs.writeFile(
    path.resolve(
      thisDir,
      '../../output/5.7.2/temp/eslint-fixed/lib.es5_out.d.ts',
    ),
    newSource,
  );
};

f().catch(console.error);
