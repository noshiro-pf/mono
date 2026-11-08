// embed-sample-code-ignore-above
/** What the list under the search box shows. */
export type SearchState = Readonly<{
  status: 'loading' | 'success';
  query: string;
}>;

/** What each version returns: a way to type, and every run of the view. */
export type SearchView = Readonly<{
  setQuery: (query: string) => void;
  viewLog: readonly string[];
}>;

/** How long a request takes to answer. A timer stands in for it below. */
export const answerMs = 100;

export const showView = (query: string, state: SearchState): string =>
  `${query} / ${state.status} for ${state.query}` as const;
