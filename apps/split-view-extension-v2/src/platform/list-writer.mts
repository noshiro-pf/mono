import { Arr } from 'ts-data-forge';
import {
  applyListOp,
  asListReply,
  asResetOriginsReply,
  listTag,
  type ListOp,
  type ListReply,
  type ListRequest,
  type ResetOriginRequest,
  type ResetOriginsReply,
} from '../core/index.mjs';
import {
  pruneWorkspaces,
  readList,
  readResetOrigins,
  readStoredList,
  removeWorkspace,
  writeList,
  writeResetOrigins,
} from './storage.mjs';

/**
 * The saved list has one writer, the service worker (spec W10): a page sends it
 * an operation, and it applies operations one at a time to the list as stored.
 */

/**
 * The worker's side: applies `op` after every operation asked for before it,
 * writes the list when it changed, and deletes a removed split view's layout
 * once the list no longer names it.
 */
export const applyStoredListOp = async (op: ListOp): Promise<ListReply> =>
  inTurn(async () => {
    const stored = await readStoredList();

    const { list, answer } = applyListOp(stored.list, op);

    if (list !== stored.list || !stored.stored) {
      await writeList(list);
    }

    if (op.kind === 'remove') {
      await removeWorkspace(op.id);
    }

    return { tag: listTag, kind: 'list', list, answer } as const;
  });

/**
 * Deletes the layouts the list does not name (spec S3), in turn with the list's
 * writes. Run when the browser starts and when the extension is installed or
 * updated, not on every page load: it reads every record, and an import writes
 * its records before the operation that lists them.
 */
export const pruneStoredWorkspaces = async (): Promise<void> =>
  inTurn(async () => pruneWorkspaces(await readList()));

/**
 * The worker's side of an always-clear toggle: in turn with every other write,
 * so that two toggles at once both land.
 */
export const applyStoredResetOrigin = async (
  origin: string,
  enabled: boolean,
): Promise<ResetOriginsReply> =>
  inTurn(async () => {
    const current = await readResetOrigins();

    const origins = enabled
      ? current.includes(origin)
        ? current
        : Arr.toPushed(current, origin)
      : current.filter((listed) => listed !== origin);

    if (origins !== current) {
      await writeResetOrigins(origins);
    }

    return { tag: listTag, kind: 'reset-origins', origins } as const;
  });

/** The page's side of a toggle: the origins as stored, or `undefined`. */
export const requestResetOrigin = async (
  origin: string,
  enabled: boolean,
): Promise<readonly string[] | undefined> => {
  const request: ResetOriginRequest = {
    tag: listTag,
    kind: 'reset-origin',
    origin,
    enabled,
  } as const;

  try {
    const answer: unknown = await chrome.runtime.sendMessage(request);

    return asResetOriginsReply(answer)?.origins;
  } catch (error) {
    console.error(error);

    return undefined;
  }
};

/**
 * The page's side: asks the worker to apply `op`, and returns the list it
 * stored, or `undefined` when no answer came.
 */
export const requestListOp = async (
  op: ListOp,
): Promise<ListReply | undefined> => {
  const request: ListRequest = { tag: listTag, kind: 'list-op', op } as const;

  try {
    const answer: unknown = await chrome.runtime.sendMessage(request);

    return asListReply(answer);
  } catch (error) {
    // The worker could not be reached, or closed the channel unanswered.
    console.error(error);

    return undefined;
  }
};

/** Runs `task` after every task queued before it, failed or not. */
const inTurn = async <T,>(task: () => Promise<T>): Promise<T> => {
  const result = mut_queue.current.catch(() => undefined).then(task);

  mut_queue.current = result;

  return result;
};

const mut_queue: { current: Promise<unknown> } = {
  current: Promise.resolve(),
};
