import { combine, map, type InitializedObservable } from 'synstate';
import {
  constant,
  If,
  mapBindable,
  view,
  type Bindable,
  type Child,
  type JSX,
} from 'synstate-dom';
import {
  absentBlocks,
  BLOCK_NAMES,
  defaultShareOf,
  sharePercents,
  shownOf,
  type BlockId,
  type ColumnIndex,
  type Layout,
} from '../layout.mjs';
import { layoutStore, reader } from '../store/index.mjs';

type Props = Readonly<{
  /** Read once: the rows are keyed by it. */
  id: BlockId;
  /** Read once: the column's group is keyed by it. */
  column: ColumnIndex;
  /** The blocks of the column, hidden ones included, top down. */
  ids$: InitializedObservable<readonly BlockId[]>;
  /** Its place in its column. */
  index$: InitializedObservable<number>;
}>;

/**
 * One block in the layout settings, with a button for each thing the pointer
 * can do to it on the page: up, down, across to the column on its left or
 * its right, and its height — or, when the blocks fill the window, its share
 * of it — and one to hide it or show it again. A hidden block can still be
 * moved, so that it comes back where it is wanted, but its size is not
 * offered until it is shown. A button that could do nothing is left out rather than disabled, so
 * tabbing along the row stops only where something can happen.
 */
export const ViewSettingsRow = ({
  id,
  column,
  ids$,
  index$,
}: Props): JSX.Element => {
  const blockName = BLOCK_NAMES[id];

  const row$ = combine([
    layoutStore.layout,
    ids$,
    index$,
    reader.features,
  ]).pipe(
    map(([layout, ids, index, features]) =>
      rowOf(layout, ids, index, id, absentBlocks(features)),
    ),
  );

  // Read when pressed, so that a handler never acts on a place it was drawn
  // at before a move.
  const current = (): Row => row$.getSnapshot().value;

  const leftName = view(row$, ({ columns }) =>
    column === 2 && columns === 3 ? 'middle' : 'left',
  );

  const rightName = view(row$, ({ columns }) =>
    column === 0 && columns === 3 ? 'middle' : 'right',
  );

  return (
    <li
      class={constant('view-settings-block')}
      data-hidden={view(row$, ({ hidden }) => hidden.toString())}
    >
      <span class={constant('view-settings-name')}>{constant(blockName)}</span>

      <If
        cond={view(row$, ({ index }) => index > 0)}
        then={
          <MoveButton
            label={constant(`Move ${blockName} up`)}
            title={constant('Up')}
            onClick={() => {
              layoutStore.move(id, { column, index: current().index - 1 });
            }}
          >
            {constant('↑')}
          </MoveButton>
        }
      />

      <If
        cond={view(row$, ({ index, count }) => index < count - 1)}
        then={
          <MoveButton
            label={constant(`Move ${blockName} down`)}
            title={constant('Down')}
            onClick={() => {
              layoutStore.move(id, { column, index: current().index + 1 });
            }}
          >
            {constant('↓')}
          </MoveButton>
        }
      />

      <If
        cond={constant(column > 0)}
        then={
          <MoveButton
            label={mapBindable(
              leftName,
              (name) => `Move ${blockName} to the ${name} column`,
            )}
            title={mapBindable(leftName, (name) => `To the ${name} column`)}
            onClick={() => {
              layoutStore.move(id, { column: column === 2 ? 1 : 0, index: 0 });
            }}
          >
            {constant('←')}
          </MoveButton>
        }
      />

      <If
        cond={view(row$, ({ columns }) => column < columns - 1)}
        then={
          <MoveButton
            label={mapBindable(
              rightName,
              (name) => `Move ${blockName} to the ${name} column`,
            )}
            title={mapBindable(rightName, (name) => `To the ${name} column`)}
            onClick={() => {
              layoutStore.move(id, { column: column === 0 ? 1 : 2, index: 0 });
            }}
          >
            {constant('→')}
          </MoveButton>
        }
      />

      <If
        cond={view(row$, ({ absent }) => absent)}
        then={
          <span
            class={constant('view-settings-height')}
            title={constant(
              'This repository has no merge-queued label, so there is no queue to draw.',
            )}
          >
            {constant('none here')}
          </span>
        }
        else={
          <>
            <If
              cond={view(row$, ({ hidden }) => hidden)}
              then={
                <span class={constant('view-settings-height')}>
                  {constant('hidden')}
                </span>
              }
              else={
                <If
                  cond={view(row$, ({ mode }) => mode === 'fill')}
                  then={
                    <ShareControls blockName={blockName} id={id} row$={row$} />
                  }
                  else={
                    <HeightControls blockName={blockName} id={id} row$={row$} />
                  }
                />
              }
            />

            <button
              aria-label={view(
                row$,
                ({ hidden }) => `${hidden ? 'Show' : 'Hide'} ${blockName}`,
              )}
              class={constant('view-settings-small')}
              type={constant('button')}
              onClick={() => {
                layoutStore.setHidden(id, !current().hidden);
              }}
            >
              {view(row$, ({ hidden }) => (hidden ? 'Show' : 'Hide'))}
            </button>
          </>
        }
      />
    </li>
  );
};

type Row = Readonly<{
  /** Its place in its column, and how many the column holds. */
  index: number;
  count: number;
  columns: Layout['columns'];
  mode: Layout['mode'];
  /** Read in the `natural` mode only. */
  height: number | undefined;
  /** Read in the `fill` mode only; absent is the default share. */
  share: number | undefined;
  /** What part of its column the share comes to, in percent. */
  percent: number;
  /** Not drawn on the page; its height or share is kept, but not offered. */
  hidden: boolean;
  /**
   * Nothing in the repository for it — the queue, where there is no
   * `merge-queued` label (`RepoFeatures` in `load-report.mts`) — so it is
   * drawn nowhere, whatever {@link hidden} says, and showing it is not
   * offered. It can still be moved, for a repository that has it.
   */
  absent: boolean;
}>;

type ControlsProps = Readonly<{
  id: BlockId;
  blockName: string;
  row$: InitializedObservable<Row>;
}>;

const MoveButton = ({
  label,
  title,
  onClick,
  children,
}: Readonly<{
  label: Bindable<string>;
  title: Bindable<string>;
  onClick: () => void;
  children: Child;
}>): JSX.Element => (
  <button
    aria-label={label}
    class={constant('view-settings-move')}
    title={title}
    type={constant('button')}
    onClick={onClick}
  >
    {children}
  </button>
);

/** Its part of the column, in the `fill` mode. */
const ShareControls = ({ id, blockName, row$ }: ControlsProps): JSX.Element => {
  const shareNow = (): number =>
    row$.getSnapshot().value.share ?? defaultShareOf(id);

  return (
    <>
      <span
        class={constant('view-settings-height')}
        title={constant('Its part of the column')}
      >
        {view(row$, ({ percent }) => `${percent}%`)}
      </span>

      <MoveButton
        label={constant(`Give ${blockName} less of the column`)}
        title={constant('Less')}
        onClick={() => {
          layoutStore.setShare(id, shareNow() - SHARE_STEP);
        }}
      >
        {constant('−')}
      </MoveButton>

      <MoveButton
        label={constant(`Give ${blockName} more of the column`)}
        title={constant('More')}
        onClick={() => {
          layoutStore.setShare(id, shareNow() + SHARE_STEP);
        }}
      >
        {constant('+')}
      </MoveButton>

      <If
        cond={view(row$, ({ share }) => share !== undefined)}
        then={
          <button
            aria-label={constant(
              `Give ${blockName} the usual share of the column`,
            )}
            class={constant('view-settings-small')}
            type={constant('button')}
            onClick={() => {
              layoutStore.setShare(id, undefined);
            }}
          >
            {constant('Usual')}
          </button>
        }
      />
    </>
  );
};

/** Its height, in the `natural` mode: its own, or what it holds. */
const HeightControls = ({
  id,
  blockName,
  row$,
}: ControlsProps): JSX.Element => {
  const taller = (): void => {
    const { height } = row$.getSnapshot().value;

    layoutStore.setHeight(
      id,
      height === undefined ? FIRST_HEIGHT : height + HEIGHT_STEP,
    );
  };

  return (
    <If
      cond={view(row$, ({ height }) => height === undefined)}
      then={
        <>
          <span class={constant('view-settings-height')}>
            {constant('natural height')}
          </span>

          <button
            aria-label={constant(
              `Give ${blockName} a height of its own, with a scroll`,
            )}
            class={constant('view-settings-small')}
            type={constant('button')}
            onClick={taller}
          >
            {constant('Fix')}
          </button>
        </>
      }
      else={
        <>
          <span class={constant('view-settings-height')}>
            {view(row$, ({ height }) => `${height ?? 0}px`)}
          </span>

          <MoveButton
            label={constant(`Make ${blockName} shorter`)}
            title={constant('Shorter')}
            onClick={() => {
              layoutStore.setHeight(
                id,
                (row$.getSnapshot().value.height ?? FIRST_HEIGHT) - HEIGHT_STEP,
              );
            }}
          >
            {constant('−')}
          </MoveButton>

          <MoveButton
            label={constant(`Make ${blockName} taller`)}
            title={constant('Taller')}
            onClick={taller}
          >
            {constant('+')}
          </MoveButton>

          <button
            aria-label={constant(`Give ${blockName} its natural height`)}
            class={constant('view-settings-small')}
            type={constant('button')}
            onClick={() => {
              layoutStore.setHeight(id, undefined);
            }}
          >
            {constant('Natural')}
          </button>
        </>
      }
    />
  );
};

const rowOf = (
  layout: Layout,
  ids: readonly BlockId[],
  index: number,
  id: BlockId,
  absent: readonly BlockId[],
): Row => {
  const shown = shownOf(layout, ids, absent);

  return {
    index,
    count: ids.length,
    columns: layout.columns,
    mode: layout.mode,
    height: layout.heights[id],
    share: layout.shares[id],
    percent: sharePercents(layout, shown)[shown.indexOf(id)] ?? 0,
    hidden: layout.hidden.includes(id),
    absent: absent.includes(id),
  };
};

/** What "Fix" gives a block that had its natural height. */
const FIRST_HEIGHT = 480;

const HEIGHT_STEP = 80;

/** A quarter of the default share. */
const SHARE_STEP = 25;
