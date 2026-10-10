import { memoNamed } from 'preact-utils';
import { useCallback } from 'preact/hooks';
import { editorStore } from '../store/index.mjs';
import { formatDateTime, type MilestoneRow } from '../view-model/index.mjs';

type Props = Readonly<{
  row: MilestoneRow;
}>;

/** One milestone: whether it is reached, its date, and its manual check. */
export const MilestoneItem = memoNamed<Props>('MilestoneItem', (props) => {
  const { row } = props;

  const { milestone } = row;

  const openNode = useCallback(() => {
    editorStore.open({ kind: 'milestone', id: milestone.id });
  }, [milestone.id]);

  const reached = row.reachedAt !== undefined;

  return (
    <li>
      <button
        className={'bp6-card milestone-item'}
        data-e2e={'milestone-row'}
        type={'button'}
        onClick={openNode}
      >
        <span
          className={`bp6-tag bp6-round milestone-badge ${reached ? 'reached' : 'pending'}`}
        >
          {reached ? '◆ 到達済み' : '◇ 未到達'}
        </span>
        <span className={'milestone-title'}>{milestone.title}</span>
        <span className={'milestone-meta'}>
          {milestone.date === undefined ? undefined : (
            <span>{formatDateTime(milestone.date)}</span>
          )}
          {milestone.requiresManualCheck ? (
            <span
              className={`bp6-tag bp6-minimal ${row.awaitingCheck ? 'bp6-intent-warning' : 'bp6-intent-success'}`}
            >
              {row.awaitingCheck ? '要確認' : '確認済み'}
            </span>
          ) : undefined}
        </span>
      </button>
    </li>
  );
});
