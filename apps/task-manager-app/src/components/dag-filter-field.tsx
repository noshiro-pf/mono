import type { GenericEventHandler } from 'preact';
import { memoNamed } from 'preact-utils';
import { Arr } from 'ts-data-forge';
import { taskLabels } from '../dag/index.mjs';
import { asGroupId } from '../domain/index.mjs';
import {
  dagFilterSignal,
  dagFilterStore,
  domainSignal,
  groupsSignal,
} from '../store/index.mjs';
import { isDagFilterEmpty } from '../view-model/index.mjs';

/**
 * 「絞り込み」: the groups and the labels the graph screen shows, in every
 * view mode — a theme at a time — each from every group there is and every
 * label on a task, with 「グループなし」 and 「ラベルなし」 after them. A
 * section of either kind is left out while there is nothing to choose in
 * it. What a choice leaves of the graph is `dag/node-filter.mts`'s; it is
 * kept in the URL (`view-model/dag-filter.mts`).
 */
export const DagFilterField = memoNamed('DagFilterField', () => {
  const filter = dagFilterSignal.value;

  const groups = groupsSignal.value;

  const labels = taskLabels(domainSignal.value);

  return (
    <fieldset aria-describedby={HINT_ID} className={'settings-field'}>
      <legend className={'settings-field-label'}>{'絞り込み'}</legend>
      {Arr.isEmpty(groups) ? undefined : (
        <fieldset className={'settings-field-control dag-filter-choices'}>
          <legend className={'dag-filter-kind'}>{'グループ'}</legend>
          {groups.map((group) => (
            <Choice
              key={group.id}
              checked={filter.groups.includes(group.id)}
              e2e={'dag-filter-group'}
              title={group.title}
              value={group.id}
              onChange={onGroupChange}
            />
          ))}
          <Choice
            checked={filter.groups.includes(undefined)}
            e2e={'dag-filter-group'}
            title={'グループなし'}
            value={''}
            onChange={onGroupChange}
          />
        </fieldset>
      )}
      {Arr.isEmpty(labels) ? undefined : (
        <fieldset className={'settings-field-control dag-filter-choices'}>
          <legend className={'dag-filter-kind'}>{'ラベル'}</legend>
          {labels.map((label) => (
            <Choice
              key={label}
              checked={filter.labels.includes(label)}
              e2e={'dag-filter-label'}
              title={label}
              value={label}
              onChange={onLabelChange}
            />
          ))}
          <Choice
            checked={filter.labels.includes(undefined)}
            e2e={'dag-filter-label'}
            title={'ラベルなし'}
            value={''}
            onChange={onLabelChange}
          />
        </fieldset>
      )}
      <p className={'settings-hint'} id={HINT_ID}>
        {Arr.isEmpty(groups) && Arr.isEmpty(labels)
          ? 'グループを作るか、タスクにラベルを付けると、ここで絞り込めます。'
          : 'どれかに当てはまるものを、グループとラベルの両方を選んだときは両方に当てはまるものを表示します。ラベルで絞るとき、マイルストーンは残ったタスクとつながるものだけを表示します。絞り込みの外でも、直接つながるノードは薄く表示します。'}
      </p>
      {isDagFilterEmpty(filter) ? undefined : (
        <button
          className={'bp6-button bp6-small'}
          data-e2e={'dag-filter-clear'}
          type={'button'}
          onClick={dagFilterStore.clear}
        >
          {'絞り込みを解除'}
        </button>
      )}
    </fieldset>
  );
});

type ChoiceProps = Readonly<{
  title: string;
  /** A group's id or a label, or empty for none. */
  value: string;
  checked: boolean;
  e2e: string;
  onChange: GenericEventHandler<HTMLInputElement>;
}>;

const Choice = memoNamed<ChoiceProps>('DagFilterChoice', (props) => {
  const { title, value, checked, e2e, onChange } = props;

  return (
    <label className={'bp6-control bp6-checkbox dag-filter-choice'}>
      <input
        checked={checked}
        className={'bp6-control-input'}
        data-e2e={e2e}
        type={'checkbox'}
        value={value}
        onChange={onChange}
      />
      <span className={'bp6-control-indicator'} />
      {title}
    </label>
  );
});

const onGroupChange: GenericEventHandler<HTMLInputElement> = (changed) => {
  const { value } = changed.currentTarget;

  dagFilterStore.toggleGroup(value === '' ? undefined : asGroupId(value));
};

const onLabelChange: GenericEventHandler<HTMLInputElement> = (changed) => {
  const { value } = changed.currentTarget;

  dagFilterStore.toggleLabel(value === '' ? undefined : value);
};

const HINT_ID = 'dag-filter-hint';
