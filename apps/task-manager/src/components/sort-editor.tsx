import { HtmlSelect } from 'blueprint-synstate';
import {
  constant,
  For,
  If,
  mapBindable,
  type Bindable,
  type JSX,
} from 'synstate-dom';
import { Arr } from 'ts-data-forge';
import { sortKeys, type SortSpec } from '../domain/index.mjs';
import { m } from '../i18n/index.mjs';
import {
  sortKeyLabels,
  unusedSortKeys,
  type SortKeyActions,
} from '../view-model/index.mjs';
import { SortKeyRow } from './sort-key-row.js';

type Props = Readonly<{
  /** The keys, first one deciding. */
  sort: Bindable<readonly SortSpec[]>;
  /** What each control does to them: a store's, which saves them. */
  actions: SortKeyActions;
  /** The accessible name of the list of keys. */
  label: string;
  /** Shown instead of the list when there are no keys. */
  emptyNote: string;
  'data-e2e': string;
}>;

/**
 * Sort keys, first one deciding: each can be flipped, moved and removed, and
 * any key not in use can be added at the end — for the list's sort
 * (`list-toolbar.tsx`) and the order of 「アーク」 and 「タイル」
 * (`diagram-sort-field.tsx`) alike, each handing it its keys and its store.
 */
export const SortEditor = ({
  sort,
  actions,
  label,
  emptyNote,
  'data-e2e': e2e,
}: Props): JSX.Element => {
  const unused = mapBindable(sort, unusedSortKeys);

  const count = mapBindable(sort, (specs) => specs.length);

  return (
    <div class={constant('sort-editor')} data-e2e={constant(e2e)}>
      <If
        cond={mapBindable(sort, Arr.isEmpty)}
        then={
          <p class={constant('bp6-text-muted sort-empty')}>
            {constant(emptyNote)}
          </p>
        }
        else={
          <ol aria-label={constant(label)} class={constant('sort-keys')}>
            <For items={sort} key={(spec) => spec.key}>
              {(spec$, index$) => (
                <SortKeyRow
                  actions={actions}
                  count={count}
                  index={index$}
                  spec={spec$}
                />
              )}
            </For>
          </ol>
        }
      />
      <If
        cond={mapBindable(unused, Arr.isNonEmpty)}
        then={
          <label class={constant('sort-add')}>
            <span class={constant('visually-hidden')}>
              {constant(m.sort.addKey)}
            </span>
            <HtmlSelect
              value={constant('')}
              onChange={(changed) => {
                const mut_select = changed.currentTarget;

                const picked = sortKeys.find((key) => key === mut_select.value);

                // Back to the prompt, which is what the field always shows.
                mut_select.value = '';

                if (picked !== undefined) {
                  actions.addKey(picked);
                }
              }}
            >
              <option value={constant('')}>
                {constant(m.sort.addKeyOption)}
              </option>
              <For items={unused} key={(key) => key}>
                {(key$) => (
                  <option value={key$}>
                    {mapBindable(key$, (key) => sortKeyLabels[key])}
                  </option>
                )}
              </For>
            </HtmlSelect>
          </label>
        }
      />
    </div>
  );
};
