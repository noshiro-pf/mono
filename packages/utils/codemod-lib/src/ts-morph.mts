import * as ts from 'typescript';
import { createTransformerFactory } from './utils/index.mjs';

export const replaceWithTsMorph = async (filepath: string): Promise<void> => {
  // const project = new Project();
  // const sourceFile = project.addSourceFileAtPath(filepath);

  const sourceCode = await fs.readFile(filepath, { encoding: 'utf8' });

  const sourceFile = ts.createSourceFile(
    'temporary.ts', // ファイル名は変換に影響しないことが多いが、必須
    sourceCode,
    ts.ScriptTarget.ESNext, // 対象とする ECMAScript バージョン
    true, // setParentNodes: true - ノード間の親子関係を維持 (重要)
  );

  // if (Math.PI < 0) {
  // replaceAnyWithUnknown(sourceFile);
  // }

  // if (filepath.includes('es2015.promise')) {
  // if (!filepath.includes('dom') && !filepath.includes('webworker')) {
  //   replaceAnyWithUnknown(sourceFile);
  //   canonicalizeToReadonly(sourceFile);
  // }

  // 2. トランスフォーマーファクトリを定義する
  //    これが AST の各ノードを訪れて変換処理を行う中心部分
  const transformerFactory: ts.TransformerFactory<ts.SourceFile> =
    createTransformerFactory((context) => {
      // visitor 関数: 各ノードを訪れたときに呼び出される
      const visitor: ts.Visitor = (node: ts.Node): ts.VisitResult<ts.Node> => {
        // ==================================================
        // === ここに具体的な変換ロジックを実装します ===
        // ==================================================

        // 例1: 特定の識別子の名前を変更する ('oldName' -> 'newName')
        if (ts.isIdentifier(node) && node.text === 'oldName') {
          // ts.factory を使って新しい識別子ノードを作成して返す
          return context.factory.createIdentifier('newName');
        }

        // 例2: 特定の関数宣言を見つける
        if (
          ts.isFunctionDeclaration(node) &&
          node.name?.text === 'targetFunction'
        ) {
          console.log(`関数 "targetFunction" を見つけました。pos: ${node.pos}`);
          // ここで関数宣言自体を書き換えたり、
          // その本体 (node.body) を visitEachChild でさらに加工したりできる
          // 例: 関数本体の先頭に console.log を追加するなど (より複雑な例)
        }

        // 例3: 特定のプロパティアクセスを書き換える (obj.oldProp -> obj.newProp)
        if (
          ts.isPropertyAccessExpression(node) &&
          node.name.text === 'oldProp'
        ) {
          // ts.factory を使って新しいプロパティアクセス式を作成して返す
          return context.factory.updatePropertyAccessExpression(
            node,
            node.expression, // obj の部分 (変更しない場合は元のノードを渡す)
            context.factory.createIdentifier('newProp'), // 新しいプロパティ名
          );
        }

        // ==================================================
        // === 実装ここまで ================================
        // ==================================================

        // 現在のノードの変換が終わったら、その子ノードに対して再帰的に visitor を適用する
        // これにより、AST 全体を深さ優先で探索・変換できる
        return ts.visitEachChild(node, visitor, context);
      };

      return visitor;
    });

  // 3. ts.transform を使って AST を変換する
  const transformationResult = ts.transform(sourceFile, [transformerFactory]);

  // 変換された AST (SourceFile) を取得
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const transformedSourceFile = transformationResult.transformed[0]!;

  // 4. 変換された AST をプリンターで文字列に戻す
  const printer = ts.createPrinter({
    newLine: ts.NewLineKind.LineFeed, // 必要に応じて改行コードなどを設定
    removeComments: false, // コメントを保持するかどうか
  });

  const resultCode = printer.printFile(transformedSourceFile);

  // 5. 変換後のコード文字列を保存
  await fs.writeFile(filepath, resultCode);
};
