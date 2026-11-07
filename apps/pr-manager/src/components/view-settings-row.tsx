// cspell:ignore Untab
import { combine, map, type InitializedObservable } from 'synstate';
import {
  constant,
  If,
  mapBindable,
  type Bindable,
  type Child,
  type JSX,
} from 'synstate-dom';
import {
  absentBlocks,
  BLOCK_NAMES,
  canStep,
  defaultShareOf,
  paneOf,
  sharePercents,
  shownOf,
  shownPanesOf,
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
 * can do to it on the page: up, down, across to the column on its left or its
 * right, and its height — or, when the blocks fill the window, its share of it
 * — and one to hide it or show it again. A hidden block can still be moved, so
 * that it comes back where it is wanted, but its size is not offered until it
 * is shown. A button that could do nothing is left out rather than disabled, so
 * tabbing along the row stops only where something can happen.
 *
 * But for the first of a column, a block can be made a tab of the one above it
 * ("Tab"), or taken out of the tabs it is in ("Untab"); up and down then move
 * it among them, and out past the first or the last. A group of tabs is drawn
 * at the size of its first tab drawn, so only that row offers the size.
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

  // Read when pressed, so that a handler never acts on a place it was drawn at
  // before a move.
  const current = (): Row => row$.getSnapshot().value;

  const leftName = row$.pipe(
    map(({ columns }) => (column === 2 && columns === 3 ? 'middle' : 'left')),
  );

  const rightName = row$.pipe(
    map(({ columns }) => (column === 0 && columns === 3 ? 'middle' : 'right')),
  );

  return (
    <li
      class={constant('view-settings-block')}
      data-hidden={row$.pipe(map(({ hidden }) => hidden.toString()))}
      data-tabbed={row$.pipe(map(({ tabbed }) => tabbed.toString()))}
    >
      <span class={constant('view-settings-name')}>{constant(blockName)}</span>

      <If
        cond={row$.pipe(map(({ up }) => up))}
        then={
          <MoveButton
            label={constant(`Move ${blockName} up`)}
            title={constant('Up')}
            onClick={() => {
              layoutStore.step(id, 'up');
            }}
          >
            {constant('↑')}
          </MoveButton>
        }
      />

      <If
        cond={row$.pipe(map(({ down }) => down))}
        then={
          <MoveButton
            label={constant(`Move ${blockName} down`)}
            title={constant('Down')}
            onClick={() => {
              layoutStore.step(id, 'down');
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
        cond={row$.pipe(map(({ columns }) => column < columns - 1))}
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
        cond={row$.pipe(map(({ canTab }) => canTab))}
        then={
          <button
            aria-label={row$.pipe(
              map(({ tabbed }) =>
                tabbed
                  ? `Take ${blockName} out of the tabs above it`
                  : `Show ${blockName} as a tab of the block above it`,
              ),
            )}
            class={constant('view-settings-small')}
            title={row$.pipe(
              map(({ tabbed }) =>
                tabbed
                  ? 'Draw it on its own again'
                  : 'Draw it in the place of the block above, one tab each',
              ),
            )}
            type={constant('button')}
            onClick={() => {
              layoutStore.setTabbed(
                id,
                !current().tabbed,
                absentBlocks(reader.features.getSnapshot().value),
              );
            }}
          >
            {row$.pipe(map(({ tabbed }) => (tabbed ? 'Untab' : 'Tab')))}
          </button>
        }
      />

      <If
        cond={row$.pipe(map(({ absent }) => absent))}
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
              cond={row$.pipe(map(({ hidden }) => hidden))}
              then={
                <span class={constant('view-settings-height')}>
                  {constant('hidden')}
                </span>
              }
              else={
                <If
                  cond={row$.pipe(map(({ sized }) => sized))}
                  then={
                    <If
                      cond={row$.pipe(map(({ mode }) => mode === 'fill'))}
                      then={<ShareControls blockName={blockName} row$={row$} />}
                      else={
                        <HeightControls blockName={blockName} row$={row$} />
                      }
                    />
                  }
                  else={
                    <span
                      class={constant('view-settings-height')}
                      title={constant(
                        'A group of tabs is drawn at one size, set on its first tab drawn',
                      )}
                    >
                      {constant('a tab')}
                    </span>
                  }
                />
              }
            />

            <button
              aria-label={row$.pipe(
                map(({ hidden }) => `${hidden ? 'Show' : 'Hide'} ${blockName}`),
              )}
              class={constant('view-settings-small')}
              type={constant('button')}
              onClick={() => {
                layoutStore.setHidden(id, !current().hidden);
              }}
            >
              {row$.pipe(map(({ hidden }) => (hidden ? 'Show' : 'Hide')))}
            </button>
          </>
        }
      />
    </li>
  );
};

type Row = Readonly<{
  /** Its place in its column. */
  index: number;
  /** Whether it can move up, and down; see `stepBlock`. */
  up: boolean;
  down: boolean;
  /** A tab of the block above it. */
  tabbed: boolean;
  /**
   * Whose height and share its place is drawn at: its own, or the first block's
   * of its group of tabs, drawn or not.
   */
  sizeKey: BlockId;
  /** The size of its place is offered here: it is the place's first drawn. */
  sized: boolean;
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
   * `merge-queued` label (`RepoFeatures` in `load-report.mts`) — so it is drawn
   * nowhere, whatever {@link hidden} says, and showing it is not offered. It
   * can still be moved, for a repository that has it.
   */
  absent: boolean;
  /**
   * A block is drawn above it in its column for "Tab" to join it to, or it is a
   * tab already, for "Untab".
   */
  canTab: boolean;
}>;

type ControlsProps = Readonly<{
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
const ShareControls = ({ blockName, row$ }: ControlsProps): JSX.Element => {
  const shareNow = (): number =>
    row$.getSnapshot().value.share ??
    defaultShareOf(row$.getSnapshot().value.sizeKey);

  return (
    <>
      <span
        class={constant('view-settings-height')}
        title={constant('Its part of the column')}
      >
        {row$.pipe(map(({ percent }) => `${percent}%`))}
      </span>

      <MoveButton
        label={constant(`Give ${blockName} less of the column`)}
        title={constant('Less')}
        onClick={() => {
          layoutStore.setShare(
            row$.getSnapshot().value.sizeKey,
            shareNow() - SHARE_STEP,
          );
        }}
      >
        {constant('−')}
      </MoveButton>

      <MoveButton
        label={constant(`Give ${blockName} more of the column`)}
        title={constant('More')}
        onClick={() => {
          layoutStore.setShare(
            row$.getSnapshot().value.sizeKey,
            shareNow() + SHARE_STEP,
          );
        }}
      >
        {constant('+')}
      </MoveButton>

      <If
        cond={row$.pipe(map(({ share }) => share !== undefined))}
        then={
          <button
            aria-label={constant(
              `Give ${blockName} the usual share of the column`,
            )}
            class={constant('view-settings-small')}
            type={constant('button')}
            onClick={() => {
              layoutStore.setShare(row$.getSnapshot().value.sizeKey, undefined);
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
const HeightControls = ({ blockName, row$ }: ControlsProps): JSX.Element => {
  const taller = (): void => {
    const { height } = row$.getSnapshot().value;

    layoutStore.setHeight(
      row$.getSnapshot().value.sizeKey,
      height === undefined ? FIRST_HEIGHT : height + HEIGHT_STEP,
    );
  };

  return (
    <If
      cond={row$.pipe(map(({ height }) => height === undefined))}
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
            {row$.pipe(map(({ height }) => `${height ?? 0}px`))}
          </span>

          <MoveButton
            label={constant(`Make ${blockName} shorter`)}
            title={constant('Shorter')}
            onClick={() => {
              layoutStore.setHeight(
                row$.getSnapshot().value.sizeKey,
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
              layoutStore.setHeight(
                row$.getSnapshot().value.sizeKey,
                undefined,
              );
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
  // The places drawn in the column, each at the size of its first block.
  const keys = shownPanesOf(layout, ids, absent).map(({ key }) => key);

  const pane = paneOf(layout, id);

  const [sizeKey = id] = pane;

  return {
    index,
    up: canStep(layout, id, 'up'),
    down: canStep(layout, id, 'down'),
    tabbed: layout.tabbed.includes(id),
    sizeKey,
    sized: shownOf(layout, pane, absent)[0] === id,
    columns: layout.columns,
    mode: layout.mode,
    height: layout.heights[sizeKey],
    share: layout.shares[sizeKey],
    percent: sharePercents(layout, keys)[keys.indexOf(sizeKey)] ?? 0,
    hidden: layout.hidden.includes(id),
    absent: absent.includes(id),
    canTab:
      layout.tabbed.includes(id) ||
      ids
        .slice(0, index)
        .some(
          (above) => !layout.hidden.includes(above) && !absent.includes(above),
        ),
  };
};

/** What "Fix" gives a block that had its natural height. */
const FIRST_HEIGHT = 480;

const HEIGHT_STEP = 80;

/** A quarter of the default share. */
const SHARE_STEP = 25;
