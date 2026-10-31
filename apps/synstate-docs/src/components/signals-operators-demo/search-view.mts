export type SearchState = Readonly<{
  status: 'loading' | 'success';
  query: string;
}>;

/** One run of the view: the query in the box, and what the list is for. */
export type ViewRow = Readonly<{ query: string; state: SearchState }>;

export type LogEntry = Readonly<{ id: number; row: ViewRow }>;

/** How long the demo's request takes to answer, which its caption quotes. */
export const requestMs = 600;
