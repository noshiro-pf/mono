import { memoNamed } from 'preact-utils';
import { useCallback } from 'preact/hooks';
import { type SortSpec } from '../domain/index.mjs';
import {
  sortKeyLabels,
  sortOrderLabels,
  type SortKeyActions,
} from '../view-model/index.mjs';

type Props = Readonly<{
  spec: SortSpec;
  index: number;
  count: number;
  actions: SortKeyActions;
}>;

export const SortKeyRow = memoNamed<Props>('SortKeyRow', (props) => {
  const { spec, index, count, actions } = props;

  const label = sortKeyLabels[spec.key];

  const toggle = useCallback(() => {
    actions.toggleOrder(index);
  }, [actions, index]);

  const moveUp = useCallback(() => {
    actions.moveKey(index, -1);
  }, [actions, index]);

  const moveDown = useCallback(() => {
    actions.moveKey(index, 1);
  }, [actions, index]);

  const remove = useCallback(() => {
    actions.removeKey(index);
  }, [actions, index]);

  return (
    <li className={'sort-key-row'}>
      <span className={'sort-key-label'}>{`${index + 1}. ${label}`}</span>
      <span className={'sort-key-controls'}>
        <button
          aria-label={`${label}の順序を切り替え（現在: ${sortOrderLabels[spec.order]}）`}
          className={'bp6-button bp6-small'}
          type={'button'}
          onClick={toggle}
        >
          {spec.order === 'asc' ? '昇順 ↑' : '降順 ↓'}
        </button>
        <button
          aria-label={`${label}を上へ`}
          className={'bp6-button bp6-small bp6-minimal'}
          disabled={index === 0}
          type={'button'}
          onClick={moveUp}
        >
          {'▲'}
        </button>
        <button
          aria-label={`${label}を下へ`}
          className={'bp6-button bp6-small bp6-minimal'}
          disabled={index === count - 1}
          type={'button'}
          onClick={moveDown}
        >
          {'▼'}
        </button>
        <button
          aria-label={`${label}を外す`}
          className={'bp6-button bp6-small bp6-minimal'}
          type={'button'}
          onClick={remove}
        >
          {'×'}
        </button>
      </span>
    </li>
  );
});
