import * as path from 'node:path';

/**
 * `dir` の直下の `<name>.json` を指すパスを返す。ファイル名にできない名前は
 * 拒否する。
 *
 * environment 名と ruleset 名は GitHub API が返す素の文字列で、パス片として
 * 使えることは何も保証していない。区切りを含む名前をそのまま結合すると、
 * 書き込み先が `dir` の外 — GitHub の現在値と突き合わせる宣言ファイルが
 * 置いてある場所 — へ出てしまう。
 *
 * 正規化ではなく拒否にしてあるのは、そういう名前が来たこと自体が異常の証拠だ
 * からで、黙って書き換えると何が起きていたのかが分からなくなる。
 */
export const settingsFilePath = (dir: string, name: string): string => {
  if (!isUsableAsFileName(name)) {
    throw new Error(
      [
        `ファイル名にできない名前です: ${JSON.stringify(name)}。`,
        `${dir} の外へ書き込もうとしている可能性があります。`,
      ].join('\n'),
    );
  }

  const resolvedDir = path.resolve(dir);

  const resolved = path.resolve(resolvedDir, `${name}.json`);

  // 二重の歯止め。上の判定が漏れても、`dir` の外には出さない。
  if (!resolved.startsWith(resolvedDir + path.sep)) {
    throw new Error(
      `書き込み先が ${resolvedDir} の外を指しています: ${resolved}`,
    );
  }

  return resolved;
};

/**
 * パス片ひとつとして読める名前か。
 *
 * `path.sep` ではなく両方の区切りを見るのは、Windows で書かれた名前が POSIX
 * 上で素通りしないようにするため。
 */
const isUsableAsFileName = (name: string): boolean =>
  name !== '' &&
  name !== '.' &&
  name !== '..' &&
  !name.includes('/') &&
  !name.includes('\\') &&
  !name.includes('\u{0}');
