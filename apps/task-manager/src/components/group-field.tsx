import { HtmlSelect } from 'blueprint-synstate';
import {
  constant,
  derive,
  For,
  view,
  type Bindable,
  type JSX,
} from 'synstate-dom';
import { dataStore } from '../store/index.mjs';

type Props = Readonly<{
  /** The draft's `groupId`: a group's id, or empty for none. */
  value: Bindable<string>;
  onChange: (changed: Readonly<{ currentTarget: HTMLSelectElement }>) => void;
}>;

/**
 * The group a node is in, chosen from every group there is, or none. A
 * group that is gone reads as none. In 「DAG」 a node is also moved in and
 * out of a group by dragging it (`dag-canvas.tsx`).
 */
export const GroupField = ({ value, onChange }: Props): JSX.Element => (
  <label class={constant('bp6-label field')}>
    {constant('グループ')}
    <HtmlSelect
      data-e2e={constant('group-select')}
      fill
      value={derive([dataStore.groups, value], (groups, id) =>
        groups.some((group) => group.id === id) ? id : '',
      )}
      onChange={onChange}
    >
      <option value={constant('')}>{constant('なし')}</option>
      <For items={dataStore.groups} key={(group) => group.id}>
        {(group$) => (
          <option value={view(group$, ({ id }) => id)}>
            {view(group$, ({ title }) => title)}
          </option>
        )}
      </For>
    </HtmlSelect>
  </label>
);
