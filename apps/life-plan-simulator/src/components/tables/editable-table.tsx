import type { InitializedObservable } from 'synstate';
import {
  constant,
  For,
  mapBindable,
  view,
  type Bindable,
  type JSX,
} from 'synstate-dom';
import { Arr } from 'ts-data-forge';
import { NumberInput, TextInput, type NumberUnit } from '../fields/index.mjs';

/**
 * 行を追加・削除・編集できる表（年収の推移、日常生活費など）。
 * `derived` の列は入力値から導出した値で、編集できない。
 */
export const EditableTable = <T extends Readonly<{ id: number }>>({
  caption,
  items,
  columns,
  update,
  createItem,
  e2e,
}: Readonly<{
  caption: string;
  items: Bindable<readonly T[]>;
  columns: readonly EditableColumn<T>[];
  update: (fn: (current: readonly T[]) => readonly T[]) => void;
  createItem: (id: number) => T;
  e2e?: string;
}>): JSX.Element => {
  const updateRow = (id: number, fn: (row: T) => T): void => {
    update((rows) => rows.map((row) => (row.id === id ? fn(row) : row)));
  };

  return (
    <div class={constant('table-wrapper')}>
      <table
        class={constant('editable')}
        data-e2e={e2e === undefined ? undefined : constant(e2e)}
      >
        <caption>{constant(caption)}</caption>
        <thead>
          <tr>
            {columns.map((c) => (
              <th scope={constant('col')}>{constant(c.header)}</th>
            ))}
            <th scope={constant('col')}>
              <span class={constant('visually-hidden')}>
                {constant('操作')}
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          <For items={items} key={(row) => row.id}>
            {(row$) => (
              <tr>
                {columns.map((c) => (
                  <td class={constant(c.kind === 'derived' ? 'derived' : '')}>
                    {cell(c, row$, updateRow)}
                  </td>
                ))}
                <td>
                  <button
                    type={constant('button')}
                    aria-label={constant(`${caption}の行を削除`)}
                    onClick={() => {
                      const { id } = row$.getSnapshot().value;

                      update((rows) => rows.filter((r) => r.id !== id));
                    }}
                  >
                    {constant('削除')}
                  </button>
                </td>
              </tr>
            )}
          </For>
        </tbody>
      </table>
      <button
        type={constant('button')}
        onClick={() => {
          update((rows) =>
            Arr.toPushed(
              rows,
              createItem(Math.max(0, ...rows.map((r) => r.id)) + 1),
            ),
          );
        }}
      >
        {mapBindable(constant(caption), (c) => `${c}に行を追加`)}
      </button>
    </div>
  );
};

export type EditableColumn<T> = Readonly<
  | {
      kind: 'derived';
      header: string;
      render: (row$: InitializedObservable<T>) => Bindable<string>;
    }
  | {
      kind: 'month' | 'text';
      header: string;
      get: (row: T) => string;
      set: (row: T, value: string) => T;
    }
  | {
      kind: 'number';
      header: string;
      unit?: NumberUnit;
      get: (row: T) => number;
      set: (row: T, value: number) => T;
    }
>;

const cell = <T extends Readonly<{ id: number }>>(
  column: EditableColumn<T>,
  row$: InitializedObservable<T>,
  updateRow: (id: number, fn: (row: T) => T) => void,
): JSX.Element | Bindable<string> => {
  switch (column.kind) {
    case 'derived':
      return column.render(row$);

    case 'number':
      return (
        <NumberInput
          label={column.header}
          unit={column.unit ?? 'plain'}
          value={view(row$, column.get)}
          onChange={(value) => {
            updateRow(row$.getSnapshot().value.id, (row) =>
              column.set(row, value),
            );
          }}
        />
      );

    case 'month':
    case 'text':
      return (
        <TextInput
          label={column.header}
          type={column.kind}
          value={view(row$, column.get)}
          onChange={(value) => {
            updateRow(row$.getSnapshot().value.id, (row) =>
              column.set(row, value),
            );
          }}
        />
      );
  }
};
