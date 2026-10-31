import { combine, map } from 'synstate';
import {
  constant,
  derive,
  For,
  If,
  mapBindable,
  view,
  type Bindable,
  type JSX,
} from 'synstate-dom';
import { Arr } from 'ts-data-forge';
import { taskLabels } from '../dag/index.mjs';
import { asGroupId } from '../domain/index.mjs';
import { m } from '../i18n/index.mjs';
import { dagFilterStore, dataStore } from '../store/index.mjs';
import { isDagFilterEmpty } from '../view-model/index.mjs';

/**
 * 「絞り込み」: the groups and the labels the graph screen shows, in every
 * view mode — a theme at a time — each from every group there is and every
 * label on a task, with 「グループなし」 and 「ラベルなし」 after them. A
 * section of either kind is left out while there is nothing to choose in it.
 * What a choice leaves of the graph is `dag/node-filter.mts`'s; it is kept in
 * the URL (`view-model/dag-filter.mts`).
 */
export const DagFilterField = (): JSX.Element => {
  const { filter } = dagFilterStore;

  const { groups } = dataStore;

  const labels$ = dataStore.state.pipe(map(taskLabels));

  const nothingToChoose = derive(
    [groups, labels$],
    (gs, ls) => Arr.isEmpty(gs) && Arr.isEmpty(ls),
  );

  return (
    <fieldset
      aria-describedby={constant(HINT_ID)}
      class={constant('settings-field')}
    >
      <legend class={constant('settings-field-label')}>
        {constant(m.settings.filter)}
      </legend>
      <If
        cond={view(groups, Arr.isNonEmpty)}
        then={
          <fieldset
            class={constant('settings-field-control dag-filter-choices')}
          >
            <legend class={constant('dag-filter-kind')}>
              {constant(m.settings.groups)}
            </legend>
            <For items={groups} key={(group) => group.id}>
              {(group$) => (
                <Choice
                  checked={combine([filter, group$]).pipe(
                    map(([f, { id }]) => f.groups.includes(id)),
                  )}
                  e2e={'dag-filter-group'}
                  title={view(group$, ({ title }) => title)}
                  value={view(group$, ({ id }) => id)}
                  onChange={onGroupChange}
                />
              )}
            </For>
            <Choice
              checked={view(filter, (f) => f.groups.includes(undefined))}
              e2e={'dag-filter-group'}
              title={constant(m.settings.noGroup)}
              value={constant('')}
              onChange={onGroupChange}
            />
          </fieldset>
        }
      />
      <If
        cond={view(labels$, Arr.isNonEmpty)}
        then={
          <fieldset
            class={constant('settings-field-control dag-filter-choices')}
          >
            <legend class={constant('dag-filter-kind')}>
              {constant(m.fields.labels)}
            </legend>
            <For items={labels$} key={(label) => label}>
              {(label$) => (
                <Choice
                  checked={combine([filter, label$]).pipe(
                    map(([f, label]) => f.labels.includes(label)),
                  )}
                  e2e={'dag-filter-label'}
                  title={label$}
                  value={label$}
                  onChange={onLabelChange}
                />
              )}
            </For>
            <Choice
              checked={view(filter, (f) => f.labels.includes(undefined))}
              e2e={'dag-filter-label'}
              title={constant(m.settings.noLabel)}
              value={constant('')}
              onChange={onLabelChange}
            />
          </fieldset>
        }
      />
      <p class={constant('settings-hint')} id={constant(HINT_ID)}>
        {mapBindable(nothingToChoose, (nothing) =>
          nothing ? m.settings.filterEmptyHint : m.settings.filterHint,
        )}
      </p>
      <If
        cond={view(filter, (f) => !isDagFilterEmpty(f))}
        then={
          <button
            class={constant('bp6-button bp6-small')}
            data-e2e={constant('dag-filter-clear')}
            type={constant('button')}
            onClick={dagFilterStore.clear}
          >
            {constant(m.settings.clearFilter)}
          </button>
        }
      />
    </fieldset>
  );
};

type ChoiceProps = Readonly<{
  title: Bindable<string>;
  /** A group's id or a label, or empty for none. */
  value: Bindable<string>;
  checked: Bindable<boolean>;
  e2e: string;
  onChange: (changed: Readonly<{ currentTarget: HTMLInputElement }>) => void;
}>;

const Choice = ({
  title,
  value,
  checked,
  e2e,
  onChange,
}: ChoiceProps): JSX.Element => (
  <label class={constant('bp6-control bp6-checkbox dag-filter-choice')}>
    <input
      checked={checked}
      class={constant('bp6-control-input')}
      data-e2e={constant(e2e)}
      type={constant('checkbox')}
      value={value}
      onChange={onChange}
    />
    <span class={constant('bp6-control-indicator')} />
    {title}
  </label>
);

const onGroupChange = (
  changed: Readonly<{ currentTarget: HTMLInputElement }>,
): void => {
  const { value } = changed.currentTarget;

  dagFilterStore.toggleGroup(value === '' ? undefined : asGroupId(value));
};

const onLabelChange = (
  changed: Readonly<{ currentTarget: HTMLInputElement }>,
): void => {
  const { value } = changed.currentTarget;

  dagFilterStore.toggleLabel(value === '' ? undefined : value);
};

const HINT_ID = 'dag-filter-hint';
