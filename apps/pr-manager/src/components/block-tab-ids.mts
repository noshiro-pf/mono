import type { BlockId } from '../layout.mjs';

/**
 * The ids of a block's tab and of what it holds, which name each other: each
 * block is in one place at a time, so its id is enough to tell them apart.
 */
export const tabIdOf = (id: BlockId): string => `block-tab-${id}` as const;

export const tabPanelIdOf = (id: BlockId): string =>
  `block-tab-panel-${id}` as const;
