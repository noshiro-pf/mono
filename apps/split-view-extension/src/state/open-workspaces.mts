import { Num, Result } from 'ts-data-forge';
import {
  readOpenSplitViewTabs,
  splitViewPagePath,
  workspaceQueryParam,
} from '../shared/index.mjs';
import { type WorkspaceEntry } from './registry.mjs';

/** Opens one workspace in a tab of its own. */
export const openWorkspaceInNewTab = async (
  workspaceId: string,
): Promise<void> => {
  await openWorkspaceTab(workspaceId, false, true);
};

/** What opening them all came to, for the line the picker shows afterwards. */
export type OpenedWorkspaces = Readonly<{
  opened: number;
  alreadyOpen: number;
}>;

/**
 * Opens every saved split view in a tab of its own, and says what it did.
 *
 * A workspace already open in a tab is left where it is rather than opened a
 * second time: two tabs on one workspace both save the layout it holds, so the
 * one closed last would write over whatever the other had been doing. Which
 * workspaces those are comes from the session record the pages keep, checked
 * against the browser here — an entry can outlive its tab, and opening nothing
 * because of a tab that is gone would be the worse mistake of the two.
 *
 * A split view last seen in a pinned tab comes back pinned. Chrome puts pinned
 * tabs at the front of the strip itself, so the rest arrive in the order of the
 * list — which is the order their `Alt+N` are in.
 */
export const openEveryWorkspaceInTabs = async (
  entries: readonly WorkspaceEntry[],
): Promise<OpenedWorkspaces> => {
  const alreadyOpen = await openWorkspaceIds();

  const missing = entries.filter((entry) => !alreadyOpen.has(entry.id));

  // One after another rather than all at once, so that the tabs land in the
  // order of the list rather than in the order the browser got round to them.
  await missing.reduce<Promise<void>>(async (previous, entry) => {
    await previous;

    await openWorkspaceTab(entry.id, entry.pinned, false);
  }, Promise.resolve());

  return {
    opened: missing.length,
    alreadyOpen: entries.length - missing.length,
  } as const;
};

export const describeOpenedWorkspaces = ({
  opened,
  alreadyOpen,
}: OpenedWorkspaces): string => {
  if (opened === 0) {
    return alreadyOpen === 0
      ? 'There is no saved split view to open.'
      : 'Every saved split view is already open in a tab.';
  }

  const openedPart =
    opened === 1
      ? 'Opened one split view in a tab of its own.'
      : (`Opened ${String(opened)} split views in tabs of their own.` as const);

  if (alreadyOpen === 0) {
    return openedPart;
  }

  return `${openedPart} ${
    alreadyOpen === 1
      ? ('One was' as const)
      : (`${String(alreadyOpen)} were` as const)
  } already open.` as const;
};

const openWorkspaceTab = async (
  workspaceId: string,
  pinned: boolean,
  active: boolean,
): Promise<void> => {
  const url = new URL(chrome.runtime.getURL(splitViewPagePath));

  url.searchParams.set(workspaceQueryParam, workspaceId);

  await chrome.tabs.create({ url: url.href, pinned, active });
};

/** The workspaces a tab is showing right now, tabs that have gone dropped. */
const openWorkspaceIds = async (): Promise<ReadonlySet<string>> => {
  const openTabs = await readOpenSplitViewTabs();

  const live = await Promise.all(
    Object.entries(openTabs).map(async ([tabId, workspaceId]) =>
      (await tabIsOpen(tabId)) ? workspaceId : undefined,
    ),
  );

  return new Set(live.filter((workspaceId) => workspaceId !== undefined));
};

const tabIsOpen = async (tabId: string): Promise<boolean> => {
  const id = Result.unwrapOkOr(Num.safeParseFloat(tabId), Number.NaN);

  if (!Number.isSafeInteger(id)) {
    return false;
  }

  try {
    await chrome.tabs.get(id);

    return true;
  } catch {
    // Closed, or closed while the service worker was asleep and never taken
    // off the list.
    return false;
  }
};
