import type { GenericEventHandler } from 'preact';
import { memoNamed } from 'preact-utils';
import { groupsSignal } from '../store/index.mjs';
import { HtmlSelect } from './html-select.js';

type Props = Readonly<{
  /** The draft's `groupId`: a group's id, or empty for none. */
  value: string;
  onChange: GenericEventHandler<HTMLSelectElement>;
}>;

/**
 * The group a node is in, chosen from every group there is, or none. A
 * group that is gone reads as none. In 「DAG」 a node is also moved in and
 * out of a group by dragging it (`dag-canvas.tsx`).
 */
export const GroupField = memoNamed<Props>('GroupField', (props) => {
  const { value, onChange } = props;

  const groups = groupsSignal.value;

  const selected = groups.some(({ id }) => id === value) ? value : '';

  return (
    <label className={'bp6-label field'}>
      {'グループ'}
      <HtmlSelect
        data-e2e={'group-select'}
        fill
        value={selected}
        onChange={onChange}
      >
        <option value={''}>{'なし'}</option>
        {groups.map((group) => (
          <option key={group.id} value={group.id}>
            {group.title}
          </option>
        ))}
      </HtmlSelect>
    </label>
  );
});
