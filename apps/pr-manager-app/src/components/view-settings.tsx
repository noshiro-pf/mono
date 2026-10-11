import type { InputEventHandler, RefCallback } from 'preact';
import { memoNamed } from 'preact-utils';
import { useMemo } from 'preact/hooks';
import { useObservableValue } from 'synstate-preact-hooks';
import { Arr } from 'ts-data-forge';
import {
  MAX_SPLIT,
  MIN_SPLIT,
  type BlockId,
  type ColumnIndex,
} from '../layout.mjs';
import { layoutStore } from '../store/index.mjs';
import { ViewSettingsRow } from './view-settings-row.js';

/**
 * The "Layout" button and the dialog it opens: one column or two, how wide
 * each is, the order of the blocks and their heights, and a way back to the
 * usual layout.
 *
 * Everything the pointer does on the page can be done here with a keyboard,
 * which is what lets the drag surfaces there be pointer-only. A native
 * `<dialog>`, opened modal, so focus and Escape are the browser's. Whether it
 * is open is the store's `settingsOpen`: the element subscribes to it, and
 * tells it when Escape closes the dialog. Every change applies at once, so
 * there is nothing to confirm or cancel.
 */
export const ViewSettings = memoNamed('ViewSettings', () => {
  const layout = useObservableValue(layoutStore.layout);

  const columns = useMemo<
    readonly (readonly [ColumnIndex, readonly BlockId[]])[]
  >(
    () =>
      layout.columns === 2
        ? [
            [0, layout.left],
            [1, layout.right],
          ]
        : [[0, layout.left]],
    [layout.columns, layout.left, layout.right],
  );

  return (
    <>
      <button
        className={'header-button'}
        type={'button'}
        onClick={layoutStore.openSettings}
      >
        {'Layout'}
      </button>

      <dialog
        ref={followOpen}
        aria-labelledby={TITLE_ID}
        className={'view-settings'}
        onClose={layoutStore.closeSettings}
      >
        <h2 className={'view-settings-title'} id={TITLE_ID}>
          {'Layout'}
        </h2>

        <fieldset className={'view-settings-group'}>
          <legend>{'Columns'}</legend>

          <label className={'view-settings-choice'}>
            <input
              checked={layout.columns === 1}
              name={'columns'}
              type={'radio'}
              onChange={oneColumn}
            />
            {'One'}
          </label>

          <label className={'view-settings-choice'}>
            <input
              checked={layout.columns === 2}
              name={'columns'}
              type={'radio'}
              onChange={twoColumns}
            />
            {'Two, on a screen wide enough for them'}
          </label>

          {layout.columns === 2 ? (
            <label className={'view-settings-choice'} htmlFor={SPLIT_ID}>
              {`Left column ${layout.split}%`}
              <input
                id={SPLIT_ID}
                max={MAX_SPLIT}
                min={MIN_SPLIT}
                type={'range'}
                value={layout.split}
                onInput={onSplitInput}
              />
            </label>
          ) : undefined}
        </fieldset>

        {columns.map(([column, ids]) => (
          <fieldset key={column} className={'view-settings-group'}>
            <legend>
              {layout.columns === 1
                ? 'Blocks, top down'
                : column === 0
                  ? 'Left column'
                  : 'Right column'}
            </legend>

            {Arr.isEmpty(ids) ? (
              <p className={'section-note'}>{'Empty.'}</p>
            ) : (
              <ol className={'view-settings-blocks'}>
                {ids.map((id, index) => (
                  <ViewSettingsRow
                    key={id}
                    column={column}
                    count={ids.length}
                    height={layout.heights[id]}
                    id={id}
                    index={index}
                    twoColumns={layout.columns === 2}
                  />
                ))}
              </ol>
            )}
          </fieldset>
        ))}

        <p className={'section-note'}>
          {
            'On the page: drag a block by the ⠿ at its top right, and its height by its bottom edge — a double click there gives the natural height back. With two columns, drag the line between them. The layout is kept in the URL.'
          }
        </p>

        <div className={'view-settings-actions'}>
          <button
            className={'view-settings-small'}
            type={'button'}
            onClick={layoutStore.reset}
          >
            {'Reset the layout'}
          </button>

          <button
            className={'header-button'}
            type={'button'}
            onClick={layoutStore.closeSettings}
          >
            {'Done'}
          </button>
        </div>
      </dialog>
    </>
  );
});

// Outside the component, since none of them reads its props: one function
// each serves every render, with no `useCallback` to keep it stable.

// A modal dialog is opened by a call, not an attribute, so the element
// follows the store by subscribing to it for as long as it is mounted.
const followOpen: RefCallback<HTMLDialogElement> = (dialog) => {
  if (dialog === null) {
    return undefined;
  }

  const subscription = layoutStore.settingsOpen.subscribe((shown) => {
    if (shown && !dialog.open) {
      dialog.showModal();
    } else if (!shown && dialog.open) {
      dialog.close();
    }
  });

  return () => {
    subscription.unsubscribe();
  };
};

const oneColumn = (): void => {
  layoutStore.setColumns(1);
};

const twoColumns = (): void => {
  layoutStore.setColumns(2);
};

const onSplitInput: InputEventHandler<HTMLInputElement> = (changed) => {
  layoutStore.setSplit(changed.currentTarget.valueAsNumber);
};

const TITLE_ID = 'view-settings-title';

const SPLIT_ID = 'view-settings-split';
