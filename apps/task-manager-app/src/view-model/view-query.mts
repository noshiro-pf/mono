/**
 * The screen shown — the list or the graph — and, on the graph's screen, its
 * view mode (`dag-view-mode.mts`), as the URL's query: `?view=list`, `?mode=arc`.
 * Read when the page loads, so that a reload, or a link, opens the screen
 * that was shown, and written as either changes (`store/view-query-sync.mts`).
 *
 * The graph, the default, is written as no `view` at all, and the mode only
 * when the graph is shown; `?view=dag`, from a link made before the graph was
 * the default, is read and then taken out. A value the page does not know is
 * read as no value: the graph for the screen, and for the mode the one kept
 * on this device. Every other parameter (`?storage=memory`) is left where it
 * is.
 */

import { dagViewModes, type DagViewMode } from './dag-view-mode.mjs';

export const views = ['list', 'dag'] as const;

export type View = (typeof views)[number];

export const DEFAULT_VIEW: View = 'dag';

export type ViewQuery = Readonly<{
  view: View;
  mode: DagViewMode;
}>;

/** What `search` asks to show; `mode` is `undefined` when it says none. */
export const parseViewQuery = (
  search: string,
): Readonly<{
  view: View;
  mode: DagViewMode | undefined;
}> => {
  const params = new URLSearchParams(search);

  const view = params.get(VIEW_KEY);

  const mode = params.get(MODE_KEY);

  return {
    view: views.find((known) => known === view) ?? DEFAULT_VIEW,
    mode: dagViewModes.find((known) => known === mode),
  };
};

/**
 * `search` saying that `shown` is shown, with a `?` unless it is empty, or
 * `search` itself when it already says so.
 */
export const withViewQuery = (search: string, shown: ViewQuery): string => {
  const params = new URLSearchParams(search);

  const view = shown.view === DEFAULT_VIEW ? undefined : shown.view;

  const mode = shown.view === 'dag' ? shown.mode : undefined;

  if (
    (params.get(VIEW_KEY) ?? undefined) === view &&
    (params.get(MODE_KEY) ?? undefined) === mode
  ) {
    return search;
  }

  setOrDelete(params, VIEW_KEY, view);

  setOrDelete(params, MODE_KEY, mode);

  const query = params.toString();

  return query === '' ? '' : `?${query}`;
};

const VIEW_KEY = 'view';

const MODE_KEY = 'mode';

const setOrDelete = (
  mut_params: URLSearchParams,
  key: string,
  value: string | undefined,
): void => {
  if (value === undefined) {
    mut_params.delete(key);
  } else {
    mut_params.set(key, value);
  }
};
