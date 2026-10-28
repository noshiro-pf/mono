/**
 * How big the nodes of the graph screen are drawn — 「コンパクト」, the title
 * alone on one line, in a small box; 「標準」, a title and its due date under
 * it; 「大」, as 「標準」 in a wider and taller box, the title on up to
 * three lines — and how the choice is kept in `localStorage` between visits,
 * on this device only. The boxes themselves are
 * `dag/graph-layout.mts`'s (`nodeBoxSize`).
 *
 * Kept as every setting is (`persisted-setting.mts`): anything stored that
 * is not a size gives 「標準」.
 */

import * as t from 'ts-fortress';
import type { ReadonlyRecord } from 'ts-type-forge';
import { persistedSetting } from './persisted-setting.mjs';

export const nodeSizes = ['compact', 'standard', 'large'] as const;

export const NodeSizeCodec = t.enumType(nodeSizes, {
  defaultValue: 'standard',
});

export type NodeSize = t.TypeOf<typeof NodeSizeCodec>;

export const DEFAULT_NODE_SIZE: NodeSize = NodeSizeCodec.defaultValue;

export const nodeSizeStorage = persistedSetting(NodeSizeCodec, {
  key: 'task-manager-app:node-size',
});

export const nodeSizeLabels = {
  compact: 'コンパクト',
  standard: '標準',
  large: '大',
} as const satisfies ReadonlyRecord<NodeSize, string>;
