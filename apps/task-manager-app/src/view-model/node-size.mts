/**
 * How big the nodes of the graph screen are drawn — 「標準」, a title and a
 * line of status and priority; 「コンパクト」, the title alone on one line,
 * in a smaller box — and how the choice is kept in `localStorage` between
 * visits, on this device only. The boxes themselves are
 * `dag/graph-layout.mts`'s (`nodeBoxSize`).
 *
 * Kept as every setting is (`persisted-setting.mts`): anything stored that
 * is not a size gives 「標準」.
 */

import * as t from 'ts-fortress';
import { type ReadonlyRecord } from 'ts-type-forge';
import { persistedSetting } from './persisted-setting.mjs';

export const nodeSizes = ['standard', 'compact'] as const;

export const NodeSizeCodec = t.enumType(nodeSizes, {
  defaultValue: 'standard',
});

export type NodeSize = t.TypeOf<typeof NodeSizeCodec>;

export const DEFAULT_NODE_SIZE: NodeSize = NodeSizeCodec.defaultValue;

export const nodeSizeStorage = persistedSetting(NodeSizeCodec, {
  key: 'task-manager-app:node-size',
});

export const nodeSizeLabels = {
  standard: '標準',
  compact: 'コンパクト',
} as const satisfies ReadonlyRecord<NodeSize, string>;
