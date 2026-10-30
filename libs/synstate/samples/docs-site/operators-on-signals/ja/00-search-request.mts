// embed-sample-code-ignore-above
/** 検索欄の下のリストが表示しているもの。 */
export type SearchState = Readonly<{
  status: 'loading' | 'success';
  query: string;
}>;

/** 各版が返すもの: 入力する手段と、view の実行のすべて。 */
export type SearchView = Readonly<{
  setQuery: (query: string) => void;
  viewLog: readonly string[];
}>;

/** リクエストが応答するまでの時間。以下ではタイマーで代用する。 */
export const answerMs = 100;

export const showView = (query: string, state: SearchState): string =>
  `${query} / ${state.status} for ${state.query}` as const;
