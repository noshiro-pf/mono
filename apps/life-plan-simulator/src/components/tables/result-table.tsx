import { HtmlTable } from 'blueprint-synstate';
import {
  constant,
  derive,
  For,
  mapBindable,
  view,
  type Bindable,
  type JSX,
} from 'synstate-dom';
import { Arr } from 'ts-data-forge';
import {
  formatYearMonth,
  yearOf,
  type MonthIndex,
} from '../../domain/index.mjs';
import { formatAmount, formatPercent } from '../../utils/index.mjs';

/**
 * 月ごとの計算結果の表。計算で導出される値なので編集できない。
 * 年ごとに表示するときは、`aggregate` が `sum` の列はその年の合計、`last` の
 * 列はその年の最後の月の値（残高など）を出す。
 */
export const ResultTable = <R,>({
  caption,
  rows,
  columns,
  monthOf,
  ageOf,
  granularity,
  e2e,
}: Readonly<{
  caption: string;
  rows: Bindable<readonly R[]>;
  columns: readonly ResultColumn<R>[];
  monthOf: (row: R) => MonthIndex;
  ageOf?: (row: R) => number;
  granularity: Bindable<Granularity>;
  e2e?: string;
}>): JSX.Element => {
  const displayRows = derive([rows, granularity], (rs, g) =>
    toDisplayRows(rs, g, columns, monthOf, ageOf),
  );

  return (
    <div class={constant('table-wrapper scroll')}>
      <HtmlTable
        bordered
        compact
        striped
        class={'result'}
        data-e2e={e2e === undefined ? undefined : constant(e2e)}
      >
        <caption>{constant(caption)}</caption>
        <thead>
          <tr>
            <th scope={constant('col')}>
              {mapBindable(granularity, (g) =>
                g === 'year' ? '年（年齢）' : '年月（年齢）',
              )}
            </th>
            {columns.map((c) => (
              <th scope={constant('col')}>{constant(c.header)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <For items={displayRows} key={(row) => row.key}>
            {(row$) => (
              <tr>
                <th scope={constant('row')}>{view(row$, (r) => r.label)}</th>
                {columns.map((_, j) => (
                  <td>{view(row$, (r) => r.cells[j] ?? '')}</td>
                ))}
              </tr>
            )}
          </For>
        </tbody>
      </HtmlTable>
    </div>
  );
};

export type Granularity = 'month' | 'year';

export type ResultColumn<R> = Readonly<{
  header: string;
  value: (row: R) => number;
  aggregate: 'last' | 'sum';
  format?: 'percent' | 'yen';
}>;

type DisplayRow = Readonly<{
  key: number;
  label: string;
  cells: readonly string[];
}>;

const toDisplayRows = <R,>(
  rows: readonly R[],
  granularity: Granularity,
  columns: readonly ResultColumn<R>[],
  monthOf: (row: R) => MonthIndex,
  ageOf: ((row: R) => number) | undefined,
): readonly DisplayRow[] => {
  const ageLabel = (row: R): string =>
    ageOf === undefined ? '' : (`（${ageOf(row)}）` as const);

  if (granularity === 'month') {
    return rows.map((row) => ({
      key: monthOf(row),
      label: `${formatYearMonth(monthOf(row))}${ageLabel(row)}`,
      cells: columns.map((c) => format(c, c.value(row))),
    }));
  }

  return groupConsecutive(rows, (row) => yearOf(monthOf(row))).map(
    ({ key: year, group }) => {
      const first = group[0];

      const last = group.at(-1);

      return {
        key: year,
        label: `${year}${first === undefined ? '' : ageLabel(first)}`,
        cells: columns.map((c) =>
          format(
            c,
            c.aggregate === 'sum'
              ? Arr.sum(group.map(c.value))
              : last === undefined
                ? 0
                : c.value(last),
          ),
        ),
      };
    },
  );
};

/** 並びを保ったまま、`keyOf` が同じ連続した要素をまとめる。 */
const groupConsecutive = <R,>(
  rows: readonly R[],
  keyOf: (row: R) => number,
): readonly Readonly<{ key: number; group: readonly R[] }>[] => {
  const mut_groups: Readonly<{ key: number; group: readonly R[] }>[] = [];

  let mut_start = 0;

  for (const [i, row] of rows.entries()) {
    const next = rows[i + 1];

    if (next !== undefined && keyOf(next) === keyOf(row)) {
      continue;
    }

    mut_groups.push({ key: keyOf(row), group: rows.slice(mut_start, i + 1) });

    mut_start = i + 1;
  }

  return mut_groups;
};

const format = <R,>(column: ResultColumn<R>, value: number): string =>
  column.format === 'percent' ? formatPercent(value) : formatAmount(value);
