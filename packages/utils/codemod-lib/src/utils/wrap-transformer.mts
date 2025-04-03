/** ファイル先頭のコメント行が消えてしまうのでダミーの `;`行を追加する（prettier.format で削除される想定） */
export const wrapSource = (src: string): string => `; ${src}`;
