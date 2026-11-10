import { combine, map } from 'synstate';
import { constant, For, If, type JSX } from 'synstate-dom';
import { Arr } from 'ts-data-forge';
import {
  DEFAULT_LAYOUT,
  lineRange,
  withColumnCount,
  withLineAt,
  withMode,
  type Layout,
} from '../../domain/index.mjs';
import type { LayoutStore } from '../../store/index.mjs';
import { followOpen } from '../common/index.mjs';
import { LayoutBlockRow } from './layout-block-row.js';
import { LayoutSlider } from './layout-slider.js';
import './layout.css';

type Props = Readonly<{ layout: LayoutStore }>;

/**
 * The Layout dialog (spec §6): everything a drag on the page does, by keyboard,
 * and what no drag does — the columns, each block's place, tabs, the height
 * mode, hiding.
 */
export const LayoutDialog = ({ layout }: Props): JSX.Element => {
  const state = combine([layout.layout, layout.absent]);

  const change = (fn: (l: Layout) => Layout): void => {
    layout.change(fn);
  };

  const columnRows = state.pipe(
    map(([l]) =>
      l.columns.map((groups, index) => ({
        index,
        count: l.columns.length,
        blocks: groups.flat(),
      })),
    ),
  );

  return (
    <dialog
      ref={followOpen(layout.dialogOpen)}
      aria-labelledby={constant('layout-title')}
      class={constant('dialog layout-dialog')}
      onClose={() => {
        layout.setDialogOpen(false);
      }}
    >
      <h2 id={constant('layout-title')}>{constant('Layout')}</h2>

      <fieldset>
        <legend>{constant('Columns')}</legend>

        {([1, 2, 3] as const).map((count) => (
          <label class={constant('radio')}>
            <input
              checked={layout.layout.pipe(
                map((l) => l.columns.length === count),
              )}
              name={constant('layout-columns')}
              type={constant('radio')}
              onChange={() => {
                change((l) => withColumnCount(l, count));
              }}
            />
            {constant(COLUMN_WORDS[count])}
          </label>
        ))}

        <If
          cond={layout.layout.pipe(map((l) => l.columns.length > 1))}
          then={
            <span class={constant('lines')}>
              <LayoutSlider
                label={layout.layout.pipe(
                  map((l) =>
                    Arr.isFixedLengthArray(2, l.columns)
                      ? `Left column ${l.split}%`
                      : `First line at ${l.lines[0]}%`,
                  ),
                )}
                percent={layout.layout.pipe(
                  map((l) =>
                    Arr.isFixedLengthArray(2, l.columns) ? l.split : l.lines[0],
                  ),
                )}
                range={layout.layout.pipe(map((l) => lineRange(l, 0)))}
                onInput={(at) => {
                  change((l) => withLineAt(l, 0, at));
                }}
              />

              <If
                cond={layout.layout.pipe(
                  map((l) => Arr.isFixedLengthArray(3, l.columns)),
                )}
                then={
                  <LayoutSlider
                    label={layout.layout.pipe(
                      map((l) => `Second line at ${l.lines[1]}%`),
                    )}
                    percent={layout.layout.pipe(map((l) => l.lines[1]))}
                    range={layout.layout.pipe(map((l) => lineRange(l, 1)))}
                    onInput={(at) => {
                      change((l) => withLineAt(l, 1, at));
                    }}
                  />
                }
              />
            </span>
          }
        />
      </fieldset>

      <fieldset>
        <legend>{constant('Height')}</legend>

        {(
          [
            ['natural', 'As tall as the blocks, and the page scrolls'],
            ['fill', 'Fill the window, and each block scrolls'],
          ] as const
        ).map(([mode, words]) => (
          <label class={constant('radio')}>
            <input
              checked={layout.layout.pipe(map((l) => l.mode === mode))}
              name={constant('layout-mode')}
              type={constant('radio')}
              onChange={() => {
                change((l) => withMode(l, mode));
              }}
            />
            {constant(words)}
          </label>
        ))}
      </fieldset>

      <For items={columnRows} key={(row) => `${row.count}-${row.index}`}>
        {(row$) => (
          <fieldset>
            <legend>
              {row$.pipe(map((row) => columnName(row.count, row.index)))}
            </legend>

            <ol class={constant('layout-rows')}>
              <For items={row$.pipe(map((row) => row.blocks))} key={(id) => id}>
                {(id$) => (
                  <LayoutBlockRow
                    change={change}
                    id={id$.getSnapshot().value}
                    state={state}
                  />
                )}
              </For>
            </ol>
          </fieldset>
        )}
      </For>

      <p class={constant('muted')}>
        {constant(
          'A hidden block keeps its place and size, and comes back there when shown. “Tab” draws a block as a tab of the block above it. On the page: drag the line under a block to set its height (double-click for its natural height, or, when the blocks fill the window, to even it with the block below), and drag the lines between columns. The layout is kept in the URL.',
        )}
      </p>

      <div class={constant('dialog-actions')}>
        <button
          class={constant('button')}
          type={constant('button')}
          onClick={() => {
            change(() => DEFAULT_LAYOUT);
          }}
        >
          {constant('Reset the layout')}
        </button>

        <form method={constant('dialog')}>
          <button class={constant('button')} type={constant('submit')}>
            {constant('Done')}
          </button>
        </form>
      </div>
    </dialog>
  );
};

const COLUMN_WORDS = {
  1: 'One',
  2: 'Two, on a screen wide enough for them',
  3: 'Three, on a screen wide enough for them',
} as const;

const columnName = (count: number, index: number): string =>
  count === 1
    ? 'Blocks'
    : index === 0
      ? 'Left column'
      : index === count - 1
        ? 'Right column'
        : 'Middle column';
