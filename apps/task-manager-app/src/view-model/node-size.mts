/**
 * How big the nodes of the graph screen are drawn — 「標準」, a title and a
 * line of status and priority; 「コンパクト」, the title alone on one line,
 * in a smaller box — and how the choice is kept in `localStorage` between
 * visits, on this device only. The boxes themselves are
 * `dag/graph-layout.mts`'s (`nodeBoxSize`).
 *
 * Validated on read as the animation setting is (`animation-setting.mts`):
 * anything that is not a size gives 「標準」.
 */

import { Json, Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import type { ReadonlyRecord } from 'ts-type-forge';

export const nodeSizes = ['standard', 'compact'] as const;

export type NodeSize = (typeof nodeSizes)[number];

export const NODE_SIZE_STORAGE_KEY = 'task-manager-app:node-size';

export const DEFAULT_NODE_SIZE: NodeSize = 'standard';

export const nodeSizeLabels = {
  standard: '標準',
  compact: 'コンパクト',
} as const satisfies ReadonlyRecord<NodeSize, string>;

/** The stored size, or 「標準」 when there is none to read. */
export const parseNodeSize = (stored: string | null): NodeSize => {
  if (stored === null) {
    return DEFAULT_NODE_SIZE;
  }

  const parsed = Result.flatMap(Json.parse(stored), (json) =>
    NodeSizeType.validate(json),
  );

  return Result.isOk(parsed) ? parsed.value : DEFAULT_NODE_SIZE;
};

export const serializeNodeSize = (size: NodeSize): string =>
  JSON.stringify(size);

const NodeSizeType = t.enumType(nodeSizes);
