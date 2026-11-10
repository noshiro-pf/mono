import { Arr, Num, Obj, Result } from 'ts-data-forge';
import type { FixedLengthTuple, ReadonlyRecord } from 'ts-type-forge';
import { readNames, writeNames, type ParamCodec } from '../url/index.mjs';
import {
  BLOCK_IDS,
  DEFAULT_LAYOUT,
  LIMITS,
  clamp,
  isDefaultShare,
  normalized,
  withColumnCount,
  type BlockId,
  type Column,
  type Group,
  type Layout,
} from './layout.mjs';

/**
 * The layout in the query string, the spelling v1 wrote so its bookmarks open
 * the same way (spec §6):
 *
 * - `cols=2|3`; absent is one. Alone, it splits the blocks as the dialog would.
 * - `left`, `middle` (three columns only), `right`: the blocks top down, `.`
 *   between groups and `_` between the tabs of one group. With one column only
 *   `left`, and only when it is not the usual order.
 * - `tab=queue`: of each group, the tab shown when it is not the head.
 * - `split=40`; `lines=25-70` (`-`, since `.` would read as a decimal point).
 * - `mode=fill`; `h.<id>=480` heights; `s.<id>=150` shares; `hide=runs.merged`.
 */
export const layoutCodec: ParamCodec<Layout> = {
  read: (params) => {
    const count =
      params.get(KEY.cols) === '3' ? 3 : params.get(KEY.cols) === '2' ? 2 : 1;

    const named = [KEY.left, KEY.middle, KEY.right].some((key) =>
      params.has(key),
    );

    const [left, middle, right] = [KEY.left, KEY.middle, KEY.right].map((key) =>
      groupsOf(params.get(key)),
    );

    const columns: readonly Column[] =
      count === 1
        ? [[...(left ?? []), ...(middle ?? []), ...(right ?? [])]]
        : count === 2
          ? [left ?? [], [...(middle ?? []), ...(right ?? [])]]
          : [left ?? [], middle ?? [], right ?? []];

    const lines = linesOf(params.get(KEY.lines));

    const read = normalized({
      columns: named ? columns : DEFAULT_LAYOUT.columns,
      split: Math.round(
        clamp(
          numberOf(params.get(KEY.split)) ?? DEFAULT_LAYOUT.split,
          LIMITS.split.min,
          LIMITS.split.max,
        ),
      ),
      lines: lines ?? DEFAULT_LAYOUT.lines,
      mode: params.get(KEY.mode) === 'fill' ? 'fill' : 'natural',
      heights: sizesOf(params, 'h', LIMITS.height),
      shares: sizesOf(params, 's', LIMITS.share),
      hidden: readNames(params, KEY.hide, BLOCK_IDS),
      selected: readNames(params, KEY.tab, BLOCK_IDS),
    });

    return withHeadSizesOnly(
      named || count === 1 ? read : withColumnCount(read, count),
    );
  },

  write: (layout, params) => {
    for (const key of Object.values(KEY)) {
      params.delete(key);
    }

    for (const id of BLOCK_IDS) {
      params.delete(`h.${id}`);

      params.delete(`s.${id}`);
    }

    const [left = [], middle = [], right = []] = layout.columns;

    if (Arr.isFixedLengthArray(1, layout.columns)) {
      if (spell(left) !== spell(DEFAULT_LAYOUT.columns[0] ?? [])) {
        params.set(KEY.left, spell(left));
      }
    } else {
      params.set(KEY.cols, layout.columns.length.toString());

      params.set(KEY.left, spell(left));

      if (Arr.isFixedLengthArray(3, layout.columns)) {
        params.set(KEY.middle, spell(middle));
      }

      params.set(
        KEY.right,
        spell(Arr.isFixedLengthArray(3, layout.columns) ? right : middle),
      );
    }

    if (layout.split !== DEFAULT_LAYOUT.split) {
      params.set(KEY.split, layout.split.toString());
    }

    if (!Arr.eq(layout.lines, DEFAULT_LAYOUT.lines)) {
      params.set(KEY.lines, layout.lines.join('-'));
    }

    if (layout.mode === 'fill') {
      params.set(KEY.mode, 'fill');
    }

    for (const id of BLOCK_IDS) {
      const height = layout.heights[id];

      const share = layout.shares[id];

      if (height !== undefined) {
        params.set(`h.${id}`, height.toString());
      }

      if (share !== undefined) {
        params.set(`s.${id}`, share.toString());
      }
    }

    writeNames(params, KEY.hide, layout.hidden);

    writeNames(params, KEY.tab, layout.selected);
  },
} as const;

/**
 * Only a group's head carries a height and a share, and only one that differs
 * from the default. An address written before a block left the head may still
 * name them for it, and kept they would come back the moment it led a group
 * again.
 */
const withHeadSizesOnly = (layout: Layout): Layout => {
  const heads = layout.columns
    .flat(/* columns → groups */)
    .map((group) => group[0]);

  return {
    ...layout,
    heights: Obj.pick(layout.heights, heads),
    shares: Obj.pick(
      layout.shares,
      heads.filter((id) => {
        const share = layout.shares[id];

        return share !== undefined && !isDefaultShare(id, share);
      }),
    ),
  };
};

const KEY = {
  cols: 'cols',
  left: 'left',
  middle: 'middle',
  right: 'right',
  split: 'split',
  lines: 'lines',
  mode: 'mode',
  hide: 'hide',
  tab: 'tab',
} as const;

const spell = (column: Column): string =>
  column.map((group) => group.join('_')).join('.');

const isBlockId = (value: string): value is BlockId =>
  BLOCK_IDS.includes(value);

const groupsOf = (value: string | null): Column =>
  Arr.generate(function* () {
    for (const piece of (value ?? '').split('.')) {
      const ids = piece.split('_').filter(isBlockId);

      if (Arr.isNonEmpty(ids)) {
        yield ids satisfies Group;
      }
    }
  });

const numberOf = (value: string | null): number | undefined => {
  if (value === null || value.trim() === '') {
    return undefined;
  }

  const parsed = Result.unwrapOkOr(Num.safeParseFloat(value), Number.NaN);

  return Number.isFinite(parsed) ? parsed : undefined;
};

const linesOf = (
  value: string | null,
): FixedLengthTuple<2, number> | undefined => {
  const [a, b] = (value ?? '').split('-').map(numberOf);

  if (a === undefined || b === undefined) {
    return undefined;
  }

  const first = Math.round(clamp(a, LIMITS.third, 100 - 2 * LIMITS.third));

  return [
    first,
    Math.round(clamp(b, first + LIMITS.third, 100 - LIMITS.third)),
  ];
};

const sizesOf = (
  params: URLSearchParams,
  prefix: string,
  limits: Readonly<{ min: number; max: number }>,
): Partial<ReadonlyRecord<BlockId, number>> =>
  Object.fromEntries(
    Arr.generate(function* () {
      for (const id of BLOCK_IDS) {
        const value = numberOf(params.get(`${prefix}.${id}`));

        if (value !== undefined) {
          yield [id, Math.round(clamp(value, limits.min, limits.max))] as const;
        }
      }
    }),
  );
