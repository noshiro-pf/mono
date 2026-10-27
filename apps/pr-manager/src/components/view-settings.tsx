import { map } from 'synstate';
import { constant, For, If, view, type Bindable, type JSX } from 'synstate-dom';
import { Arr } from 'ts-data-forge';
import {
  columnsOf,
  columnWidths,
  MAX_SPLIT,
  MIN_SPLIT,
  MIN_THIRD_WIDTH,
  type ColumnIndex,
  type Layout,
} from '../layout.mjs';
import { layoutStore } from '../store/index.mjs';
import { followOpen } from './follow-open.mjs';
import { ViewSettingsRow } from './view-settings-row.js';

/**
 * The "Layout" button and the dialog it opens: one column, two or three, how
 * wide each is, whether the page scrolls or fills the window, the order of the
 * blocks, which of them are shown, and their heights or shares, and a way back to the usual layout.
 *
 * Everything the pointer does on the page can be done here with a keyboard,
 * which is what lets the drag surfaces there be pointer-only. A native
 * `<dialog>`, opened modal, so focus and Escape are the browser's. Whether it
 * is open is the store's `settingsOpen`: the element follows it, and
 * tells it when Escape closes the dialog. Every change applies at once, so
 * there is nothing to confirm or cancel.
 */
export const ViewSettings = (): JSX.Element => {
  const layout$ = layoutStore.layout;

  return (
    <>
      <button
        class={constant('header-button')}
        type={constant('button')}
        onClick={layoutStore.openSettings}
      >
        {constant('Layout')}
      </button>

      <dialog
        ref={followOpen(layoutStore.settingsOpen)}
        aria-labelledby={constant(TITLE_ID)}
        class={constant('view-settings')}
        onClose={layoutStore.closeSettings}
      >
        <h2 class={constant('view-settings-title')} id={constant(TITLE_ID)}>
          {constant('Layout')}
        </h2>

        <fieldset class={constant('view-settings-group')}>
          <legend>{constant('Columns')}</legend>

          <Choice
            checked={view(layout$, ({ columns }) => columns === 1)}
            label={'One'}
            name={'columns'}
            onChoose={oneColumn}
          />

          <Choice
            checked={view(layout$, ({ columns }) => columns === 2)}
            label={'Two, on a screen wide enough for them'}
            name={'columns'}
            onChoose={twoColumns}
          />

          <Choice
            checked={view(layout$, ({ columns }) => columns === 3)}
            label={'Three, on a screen wide enough for them'}
            name={'columns'}
            onChoose={threeColumns}
          />

          <If
            cond={view(layout$, ({ columns }) => columns === 2)}
            then={
              <label
                class={constant('view-settings-choice')}
                htmlFor={constant(SPLIT_ID)}
              >
                {view(layout$, ({ split }) => `Left column ${split}%`)}
                <input
                  id={constant(SPLIT_ID)}
                  max={constant(MAX_SPLIT.toString())}
                  min={constant(MIN_SPLIT.toString())}
                  type={constant('range')}
                  value={view(layout$, ({ split }) => split.toString())}
                  onInput={(changed) => {
                    layoutStore.setSplit(changed.currentTarget.valueAsNumber);
                  }}
                />
              </label>
            }
          />

          <If
            cond={view(layout$, ({ columns }) => columns === 3)}
            then={
              <>
                <label
                  class={constant('view-settings-choice')}
                  htmlFor={constant(FIRST_LINE_ID)}
                >
                  {view(
                    layout$,
                    (layout) => `Left column ${columnWidths(layout)[0] ?? 0}%`,
                  )}
                  <input
                    id={constant(FIRST_LINE_ID)}
                    max={view(layout$, ({ lines }) =>
                      (lines[1] - MIN_THIRD_WIDTH).toString(),
                    )}
                    min={constant(MIN_THIRD_WIDTH.toString())}
                    type={constant('range')}
                    value={view(layout$, ({ lines }) => lines[0].toString())}
                    onInput={(changed) => {
                      layoutStore.setLine(
                        0,
                        changed.currentTarget.valueAsNumber,
                      );
                    }}
                  />
                </label>

                <label
                  class={constant('view-settings-choice')}
                  htmlFor={constant(SECOND_LINE_ID)}
                >
                  {view(
                    layout$,
                    (layout) => `Right column ${columnWidths(layout)[2] ?? 0}%`,
                  )}
                  <input
                    id={constant(SECOND_LINE_ID)}
                    max={view(layout$, ({ lines }) =>
                      (100 - lines[0] - MIN_THIRD_WIDTH).toString(),
                    )}
                    min={constant(MIN_THIRD_WIDTH.toString())}
                    type={constant('range')}
                    value={view(layout$, ({ lines }) =>
                      (100 - lines[1]).toString(),
                    )}
                    // The right column's slider counts from the right, so
                    // that more is wider for both: the line it moves is 100
                    // less its value.
                    onInput={(changed) => {
                      layoutStore.setLine(
                        1,
                        100 - changed.currentTarget.valueAsNumber,
                      );
                    }}
                  />
                </label>

                <p class={constant('section-note')}>
                  {view(
                    layout$,
                    (layout) =>
                      `The middle column has the rest, ${columnWidths(layout)[1] ?? 0}%.`,
                  )}
                </p>
              </>
            }
          />
        </fieldset>

        <fieldset class={constant('view-settings-group')}>
          <legend>{constant('Height')}</legend>

          <Choice
            checked={view(layout$, ({ mode }) => mode === 'natural')}
            label={'As tall as the blocks, and the page scrolls'}
            name={'mode'}
            onChoose={naturalMode}
          />

          <Choice
            checked={view(layout$, ({ mode }) => mode === 'fill')}
            label={'Fill the window, and each block scrolls'}
            name={'mode'}
            onChoose={fillMode}
          />
        </fieldset>

        <For items={view(layout$, columnIndicesOf)} key={(column) => column}>
          {(column$) => {
            // The key is the column, so the row's column is the one it was
            // made with.
            const column = column$.getSnapshot().value;

            const ids$ = layout$.pipe(
              map((layout) => columnsOf(layout)[column] ?? []),
            );

            return (
              <fieldset class={constant('view-settings-group')}>
                <legend>
                  {view(layout$, (layout) => columnName(layout, column))}
                </legend>

                <If
                  cond={view(ids$, Arr.isEmpty)}
                  then={
                    <p class={constant('section-note')}>{constant('Empty.')}</p>
                  }
                  else={
                    <ol class={constant('view-settings-blocks')}>
                      <For items={ids$} key={(id) => id}>
                        {(id$, index$) => (
                          <ViewSettingsRow
                            column={column}
                            id={id$.getSnapshot().value}
                            ids$={ids$}
                            index$={index$}
                          />
                        )}
                      </For>
                    </ol>
                  }
                />
              </fieldset>
            );
          }}
        </For>

        <p class={constant('section-note')}>
          {constant(
            'A hidden block keeps its place and its size, and comes back there when shown. On the page: drag the line under a block to set its height — a double click there gives the natural height back, or, when the blocks fill the window, evens it with the block below. With two or three columns, drag the lines between them. The layout is kept in the URL.',
          )}
        </p>

        <div class={constant('view-settings-actions')}>
          <button
            class={constant('view-settings-small')}
            type={constant('button')}
            onClick={layoutStore.reset}
          >
            {constant('Reset the layout')}
          </button>

          <button
            class={constant('header-button')}
            type={constant('button')}
            onClick={layoutStore.closeSettings}
          >
            {constant('Done')}
          </button>
        </div>
      </dialog>
    </>
  );
};

/** One radio button of a group, with its label. */
const Choice = ({
  checked,
  label,
  name,
  onChoose,
}: Readonly<{
  checked: Bindable<boolean>;
  label: string;
  name: string;
  onChoose: () => void;
}>): JSX.Element => (
  <label class={constant('view-settings-choice')}>
    <input
      checked={checked}
      name={constant(name)}
      type={constant('radio')}
      onChange={onChoose}
    />
    {constant(label)}
  </label>
);

const columnIndicesOf = (layout: Layout): readonly ColumnIndex[] =>
  COLUMN_INDICES.slice(0, layout.columns);

const columnName = (layout: Layout, column: ColumnIndex): string =>
  layout.columns === 1
    ? 'Blocks, top down'
    : column === 0
      ? 'Left column'
      : column === 1 && layout.columns === 3
        ? 'Middle column'
        : 'Right column';

const oneColumn = (): void => {
  layoutStore.setColumns(1);
};

const twoColumns = (): void => {
  layoutStore.setColumns(2);
};

const threeColumns = (): void => {
  layoutStore.setColumns(3);
};

const naturalMode = (): void => {
  layoutStore.setMode('natural');
};

const fillMode = (): void => {
  layoutStore.setMode('fill');
};

const COLUMN_INDICES = [0, 1, 2] as const satisfies readonly ColumnIndex[];

const TITLE_ID = 'view-settings-title';

const SPLIT_ID = 'view-settings-split';

const FIRST_LINE_ID = 'view-settings-first-line';

const SECOND_LINE_ID = 'view-settings-second-line';
