import type { GenericEventHandler } from 'preact';
import { memoNamed } from 'preact-utils';
import { useCallback } from 'preact/hooks';
import { Arr } from 'ts-data-forge';
import { sortKeys, type SortSpec } from '../domain/index.mjs';
import {
  sortKeyLabels,
  unusedSortKeys,
  type SortKeyActions,
} from '../view-model/index.mjs';
import { HtmlSelect } from './html-select.js';
import { SortKeyRow } from './sort-key-row.js';

type Props = Readonly<{
  /** The keys, first one deciding. */
  sort: readonly SortSpec[];
  /** What each control does to them: a store's, which saves them. */
  actions: SortKeyActions;
  /** The accessible name of the list of keys. */
  label: string;
  /** Shown instead of the list when there are no keys. */
  emptyNote: string;
  'data-e2e': string;
}>;

/**
 * Sort keys, first one deciding: each can be flipped, moved and removed,
 * and any key not in use can be added at the end — for the list's sort
 * (`list-toolbar.tsx`) and the order of 「アーク」 and 「タイル」
 * (`diagram-sort-field.tsx`) alike, each handing it its keys and its store.
 */
export const SortEditor = memoNamed<Props>('SortEditor', (props) => {
  const { sort, actions, label, emptyNote, 'data-e2e': e2e } = props;

  const unused = unusedSortKeys(sort);

  const addKey: GenericEventHandler<HTMLSelectElement> = useCallback(
    (changed) => {
      const picked = sortKeys.find(
        (key) => key === changed.currentTarget.value,
      );

      if (picked !== undefined) {
        actions.addKey(picked);
      }
    },
    [actions],
  );

  return (
    <div className={'sort-editor'} data-e2e={e2e}>
      {Arr.isEmpty(sort) ? (
        <p className={'bp6-text-muted sort-empty'}>{emptyNote}</p>
      ) : (
        <ol aria-label={label} className={'sort-keys'}>
          {sort.map((spec, index) => (
            <SortKeyRow
              key={spec.key}
              actions={actions}
              count={sort.length}
              index={index}
              spec={spec}
            />
          ))}
        </ol>
      )}
      {Arr.isEmpty(unused) ? undefined : (
        <label className={'sort-add'}>
          <span className={'visually-hidden'}>{'キーを追加'}</span>
          <HtmlSelect value={''} onChange={addKey}>
            <option value={''}>{'＋キーを追加…'}</option>
            {unused.map((key) => (
              <option key={key} value={key}>
                {sortKeyLabels[key]}
              </option>
            ))}
          </HtmlSelect>
        </label>
      )}
    </div>
  );
});
