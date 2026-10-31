/**
 * Whether the graph screen draws the done tasks and the reached milestones,
 * in every view mode — not unless asked for in 「表示設定」, since what is
 * done or reached is waited for by nobody — and how that is kept in
 * `localStorage` between visits, on this device only. Which nodes that leaves
 * out is `dag/hidden-nodes.mts`'s.
 *
 * Kept as every setting is (`persisted-setting.mts`): anything stored that is
 * not a boolean hides them.
 */

import * as t from 'ts-fortress';
import { persistedSetting } from './persisted-setting.mjs';

export const DagShowDoneCodec = t.boolean(false);

export const DEFAULT_DAG_SHOW_DONE: boolean = DagShowDoneCodec.defaultValue;

export const dagShowDoneStorage = persistedSetting(DagShowDoneCodec, {
  key: 'task-manager-app:dag-show-done',
});
