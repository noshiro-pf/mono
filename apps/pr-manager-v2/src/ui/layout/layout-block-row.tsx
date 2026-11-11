import { map, type InitializedObservable } from 'synstate';
import { constant, If, type JSX } from 'synstate-dom';
import { Optional } from 'ts-data-forge';
import {
  BLOCK_NAMES,
  canMoveAcross,
  canSeparate,
  canStep,
  canTab,
  drawnColumns,
  LIMITS,
  moveAcross,
  placeOf,
  shareOf,
  sharePercents,
  stepBlock,
  withHeight,
  withHidden,
  withShare,
  withTabbed,
  type BlockId,
  type Layout,
} from '../../domain/index.mjs';

export const LayoutBlockRow = ({
  id,
  state,
  change,
}: Readonly<{
  id: BlockId;
  state: InitializedObservable<readonly [Layout, readonly BlockId[]]>;
  change: (fn: (l: Layout) => Layout) => void;
}>): JSX.Element => {
  const of = <T,>(
    fn: (l: Layout, absent: readonly BlockId[]) => T,
  ): InitializedObservable<T> =>
    state.pipe(map(([l, absent]) => fn(l, absent)));

  // Each button stays where it is, marked unavailable rather than removed, and
  // a pair that undoes each other (Hide and Show) is one button that turns, so
  // that a press never takes away the button that has focus. A move to another
  // column draws the row anew there; focus follows it by the button's label.
  const button = (
    label: string,
    title: string,
    enabled: (l: Layout) => boolean,
    apply: (l: Layout, absent: readonly BlockId[]) => Layout,
    shown: (l: Layout) => boolean = () => true,
  ): JSX.Element =>
    toggle(shown, () => false, { label, title, enabled, apply }, undefined);

  const toggle = (
    shown: (l: Layout) => boolean,
    isOn: (l: Layout) => boolean,
    off: Action,
    on: Action | undefined,
  ): JSX.Element => {
    const actionOf = (l: Layout): Action =>
      on !== undefined && isOn(l) ? on : off;

    return (
      <If
        cond={of(shown)}
        then={
          <button
            aria-disabled={of((l) => (!actionOf(l).enabled(l)).toString())}
            aria-label={of((l) => `${actionOf(l).title}: ${BLOCK_NAMES[id]}`)}
            class={constant('button small')}
            title={of((l) => actionOf(l).title)}
            type={constant('button')}
            onClick={(event) => {
              const [layout, absent] = Optional.unwrap(state.getSnapshot());

              const action = actionOf(layout);

              if (!action.enabled(layout)) {
                return;
              }

              const pressed = event.currentTarget;

              // Asked before the change, which may take the button away.
              refocus(pressed, `${action.title}: ${BLOCK_NAMES[id]}`);

              change((l) => action.apply(l, absent));
            }}
          >
            {of((l) => actionOf(l).label)}
          </button>
        }
      />
    );
  };

  const isHead = (l: Layout): boolean => placeOf(l, id).tab === 0;

  return (
    <li
      class={constant('layout-row')}
      data-tab={of((l) => (!isHead(l)).toString())}
      data-hidden={of((l, absent) =>
        (l.hidden.includes(id) || absent.includes(id)).toString(),
      )}
    >
      <span class={constant('layout-row-name')}>
        {constant(BLOCK_NAMES[id])}
        {of((_, absent) => (absent.includes(id) ? ' (none here)' : ''))}
      </span>

      {button(
        '↑',
        'Move up',
        (l) => canStep(l, id, 'up'),
        (l) => stepBlock(l, id, 'up'),
      )}
      {button(
        '↓',
        'Move down',
        (l) => canStep(l, id, 'down'),
        (l) => stepBlock(l, id, 'down'),
      )}
      {button(
        '←',
        'Move to the column on the left',
        (l) => canMoveAcross(l, id, 'left'),
        (l) => moveAcross(l, id, 'left'),
      )}
      {button(
        '→',
        'Move to the column on the right',
        (l) => canMoveAcross(l, id, 'right'),
        (l) => moveAcross(l, id, 'right'),
      )}
      {toggle(
        () => true,
        (l) => !isHead(l),
        {
          label: 'Tab',
          title: 'Make it a tab of the block above',
          enabled: (l) => canTab(l, id),
          apply: (l, absent) => withTabbed(l, id, true, absent),
        },
        {
          label: 'Apart',
          title: 'Make it a block of its own',
          enabled: (l) => canSeparate(l, id),
          apply: (l) => withTabbed(l, id, false),
        },
      )}

      <span class={constant('layout-row-size muted')}>
        {of((l, absent) => sizeWords(l, absent, id))}
      </span>

      {toggle(
        (l) => l.mode === 'natural' && isHead(l),
        (l) => l.heights[id] !== undefined,
        {
          label: 'Fix',
          title: 'Give it a height of its own',
          enabled: () => true,
          apply: (l) => withHeight(l, id, measuredHeight(id)),
        },
        {
          label: 'Natural',
          title: 'Give it its natural height back',
          enabled: () => true,
          apply: (l) => withHeight(l, id, undefined),
        },
      )}
      {button(
        '−',
        'Less of the column',
        (l) => shareOf(l, id) > LIMITS.share.min,
        (l) => withShare(l, id, shareOf(l, id) * 0.8),
        (l) => l.mode === 'fill' && isHead(l),
      )}
      {button(
        '+',
        'More of the column',
        (l) => shareOf(l, id) < LIMITS.share.max,
        (l) => withShare(l, id, shareOf(l, id) * 1.25),
        (l) => l.mode === 'fill' && isHead(l),
      )}
      {toggle(
        () => true,
        (l) => l.hidden.includes(id),
        {
          label: 'Hide',
          title: 'Hide it',
          enabled: () => true,
          apply: (l) => withHidden(l, id, true),
        },
        {
          label: 'Show',
          title: 'Show it again',
          enabled: () => true,
          apply: (l) => withHidden(l, id, false),
        },
      )}
    </li>
  );
};

/** What a button of a row does, and whether it can now. */
type Action = Readonly<{
  label: string;
  title: string;
  enabled: (l: Layout) => boolean;
  apply: (l: Layout, absent: readonly BlockId[]) => Layout;
}>;

/**
 * Puts focus back on the button pressed, or, when the press drew its row anew
 * (a move to another column), on the button of that name in the dialog.
 */
const refocus = (pressed: HTMLElement, name: string): void => {
  const dialog = pressed.closest('dialog');

  // Once the dialog has drawn the change, which may be a task later.
  setTimeout(() => {
    if (pressed.isConnected) {
      if (document.activeElement !== pressed) {
        pressed.focus();
      }

      return;
    }

    const again = Array.from(
      dialog?.querySelectorAll<HTMLElement>('button[aria-label]') ?? [],
    ).find((b) => b.getAttribute('aria-label') === name);

    again?.focus();
  }, 0);
};

/** The block's height on screen now, to fix it at. */
const measuredHeight = (id: BlockId): number =>
  document
    .querySelector(`[data-head='${CSS.escape(id)}']`)
    ?.getBoundingClientRect().height ?? 400;

const sizeWords = (
  layout: Layout,
  absent: readonly BlockId[],
  id: BlockId,
): string => {
  if (placeOf(layout, id).tab > 0) {
    return 'a tab';
  }

  if (layout.mode === 'natural') {
    const height = layout.heights[id];

    return height === undefined ? 'natural height' : `${height}px`;
  }

  const { column } = placeOf(layout, id);

  const groups = drawnColumns(layout, absent)[column] ?? [];

  const at = groups.findIndex((g) => g.head === id);

  const percent = sharePercents(groups)[at];

  return percent === undefined ? 'hidden' : `${percent}% of the column`;
};
